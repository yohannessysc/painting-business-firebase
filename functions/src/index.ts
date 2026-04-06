import cors from "cors";
import express, { Request, Response } from "express";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { DocumentReference, getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { buildSeedPayload, LeadDocument } from "./modules/firestore-schema";

if (process.env.FUNCTIONS_EMULATOR === "true" && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}

initializeApp();

const db = getFirestore();
const auth = getAuth();

type AuthenticatedRequest = Request & { userId?: string };

const allowedServiceTypes = [
  "Interior Painting",
  "Exterior Painting",
  "Cabinet Refinishing",
  "Commercial Spaces",
] as const;

const allowedConsultationTypes = [
  "In-Person Consultation",
  "Virtual Consultation",
  "Phone Planning Call",
] as const;

const daytimeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
] as const;

const virtualExtraSlots = ["Evening Callback"] as const;

function isValidIsoDate(input: string): boolean {
  if (!input) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return false;
  }

  const parsed = new Date(`${input}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
}

function getTodayIsoDateUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function isPastIsoDate(input: string): boolean {
  if (!input || !isValidIsoDate(input)) {
    return false;
  }

  return input < getTodayIsoDateUtc();
}

function parseSlotStartToUtcMinutes(slot: string): number | null {
  const [startRange] = slot.split(" - ");
  const match = startRange.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  const hourRaw = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  let hour = hourRaw % 12;
  if (meridiem === "PM") {
    hour += 12;
  }

  return hour * 60 + minute;
}

function getAvailableSlots(consultationType: string, preferredDate?: string): string[] {
  const baseSlots: string[] = [...daytimeSlots];

  if (consultationType === "Virtual Consultation") {
    baseSlots.push(...virtualExtraSlots);
  }

  if (!preferredDate) {
    return baseSlots;
  }

  const date = new Date(`${preferredDate}T00:00:00.000Z`);
  const day = date.getUTCDay();

  // Keep weekends lighter for booking expectations.
  if (day === 0 || day === 6) {
    const weekendSlots = baseSlots.filter((slot) => ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "Evening Callback"].includes(slot));
    if (preferredDate !== getTodayIsoDateUtc()) {
      return weekendSlots;
    }

    const now = new Date();
    const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    return weekendSlots.filter((slot) => {
      const startMinutes = parseSlotStartToUtcMinutes(slot);
      if (startMinutes === null) {
        return true;
      }

      return startMinutes > nowMinutes;
    });
  }

  if (preferredDate !== getTodayIsoDateUtc()) {
    return baseSlots;
  }

  const now = new Date();
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return baseSlots.filter((slot) => {
    const startMinutes = parseSlotStartToUtcMinutes(slot);
    if (startMinutes === null) {
      return true;
    }

    return startMinutes > nowMinutes;
  });
}

const allowedProjectSizes = ["small", "medium", "large"] as const;
const allowedConditions = ["light", "standard", "heavy"] as const;
const allowedLeadStatuses = ["new", "contacted", "scheduled", "closed"] as const;

const leadValidation = {
  fullName: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { minDigits: 7, maxDigits: 15, maxLength: 25 },
  message: { max: 1500 },
} as const;

const leadRateLimit = {
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
} as const;

const leadRequestLog = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const forwardedFor = String(req.headers["x-forwarded-for"] ?? "").trim();
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = String(req.headers["x-real-ip"] ?? "").trim();
  if (realIp) {
    return realIp;
  }

  return req.ip || "unknown";
}

function isLeadRateLimited(ip: string, nowMs: number): boolean {
  const existing = leadRequestLog.get(ip) ?? [];
  const cutoff = nowMs - leadRateLimit.windowMs;
  const recent = existing.filter((stamp) => stamp > cutoff);

  if (recent.length >= leadRateLimit.maxRequests) {
    leadRequestLog.set(ip, recent);
    return true;
  }

  recent.push(nowMs);
  leadRequestLog.set(ip, recent);
  return false;
}

function pruneRateLimitEntries(nowMs: number): void {
  const cutoff = nowMs - leadRateLimit.windowMs;
  for (const [ip, stamps] of leadRequestLog.entries()) {
    const recent = stamps.filter((stamp) => stamp > cutoff);
    if (recent.length === 0) {
      leadRequestLog.delete(ip);
      continue;
    }

    leadRequestLog.set(ip, recent);
  }
}

function isValidEmail(email: string): boolean {
  if (!email || email.length > leadValidation.email.max) {
    return false;
  }

  // Practical email validation that blocks malformed addresses without over-restricting.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasDisallowedControlChars(input: string): boolean {
  // Allow tabs/newlines for message formatting; reject other low ASCII control chars.
  return /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input);
}

function isValidPhone(phone: string): boolean {
  if (!phone || phone.length > leadValidation.phone.maxLength) {
    return false;
  }

  if (!/^[+()\-\s0-9.]+$/.test(phone)) {
    return false;
  }

  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= leadValidation.phone.minDigits && digitCount <= leadValidation.phone.maxDigits;
}

type EstimateInput = {
  serviceType: string;
  projectSize: string;
  condition: string;
};

function calculateEstimateRange(input: EstimateInput): { low: number; high: number } {
  const baseByService: Record<string, number> = {
    "Interior Painting": 1800,
    "Exterior Painting": 3200,
    "Cabinet Refinishing": 2200,
    "Commercial Spaces": 4500,
  };

  const sizeMultiplier: Record<string, number> = {
    small: 0.8,
    medium: 1,
    large: 1.35,
  };

  const conditionMultiplier: Record<string, number> = {
    light: 0.9,
    standard: 1,
    heavy: 1.25,
  };

  const base = baseByService[input.serviceType] ?? 2000;
  const estimate =
    base * (sizeMultiplier[input.projectSize] ?? 1) * (conditionMultiplier[input.condition] ?? 1);
  const low = Math.round((estimate * 0.88) / 50) * 50;
  const high = Math.round((estimate * 1.15) / 50) * 50;

  return { low, high };
}

async function isAdminUser(userId: string): Promise<boolean> {
  const userDoc = await db.collection("users").doc(userId).get();
  return userDoc.exists && userDoc.data()?.role === "admin";
}

async function requireAdmin(req: AuthenticatedRequest, res: Response): Promise<boolean> {
  const authHeader = String(req.headers.authorization ?? "").trim();
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return false;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing authorization token" });
    return false;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    if (!(await isAdminUser(decoded.uid))) {
      res.status(403).json({ error: "Admin access required" });
      return false;
    }

    req.userId = decoded.uid;
    return true;
  } catch {
    res.status(401).json({ error: "Invalid authorization token" });
    return false;
  }
}

function normalizePositiveLimit(raw: string, fallback = 25): number {
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, 100);
}

function serializeLead(data: Record<string, unknown>, id: string): Record<string, unknown> {
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

  return {
    id,
    ...data,
    createdAt,
    updatedAt,
  };
}

const app = express();
const corsHandler = cors({ origin: true });

app.use(express.json({ limit: "16kb" }));
app.use(corsHandler);

app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: "painting-business-api" });
});

app.post(["/leads", "/api/leads"], async (req: Request, res: Response) => {
  const nowMs = Date.now();
  pruneRateLimitEntries(nowMs);

  const clientIp = getClientIp(req);
  if (isLeadRateLimited(clientIp, nowMs)) {
    res.setHeader("Retry-After", String(Math.ceil(leadRateLimit.windowMs / 1000)));
    res.status(429).json({
      error: "Too many requests. Please wait a few minutes before submitting again.",
    });
    return;
  }

  const {
    fullName,
    email,
    phone,
    serviceType,
    consultationType,
    preferredDate,
    preferredTimeSlot,
    message,
    website,
  } = req.body ?? {};

  const normalizedFullName = String(fullName ?? "").trim();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedPhone = String(phone ?? "").trim();
  const normalizedServiceType = String(serviceType ?? "").trim();
  const normalizedConsultationType = String(consultationType ?? "").trim();
  const normalizedPreferredDate = String(preferredDate ?? "").trim();
  const normalizedPreferredTimeSlot = String(preferredTimeSlot ?? "").trim();
  const normalizedMessage = String(message ?? "").trim();
  const normalizedWebsite = String(website ?? "").trim();

  if (normalizedWebsite) {
    res.status(202).json({ ok: true });
    return;
  }

  if (
    !normalizedFullName ||
    !normalizedEmail ||
    !normalizedPhone ||
    !normalizedServiceType ||
    !normalizedConsultationType ||
    !normalizedPreferredDate ||
    !normalizedPreferredTimeSlot
  ) {
    res.status(400).json({ error: "Missing required lead fields" });
    return;
  }

  if (
    normalizedFullName.length < leadValidation.fullName.min ||
    normalizedFullName.length > leadValidation.fullName.max
  ) {
    res.status(400).json({ error: "Full name length is invalid" });
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  if (!isValidPhone(normalizedPhone)) {
    res.status(400).json({ error: "Invalid phone format" });
    return;
  }

  if (!allowedServiceTypes.includes(normalizedServiceType as (typeof allowedServiceTypes)[number])) {
    res.status(400).json({ error: "Unsupported service type" });
    return;
  }

  if (!allowedConsultationTypes.includes(normalizedConsultationType as (typeof allowedConsultationTypes)[number])) {
    res.status(400).json({ error: "Unsupported consultation type" });
    return;
  }

  if (!isValidIsoDate(normalizedPreferredDate)) {
    res.status(400).json({ error: "Invalid preferred date format" });
    return;
  }

  if (isPastIsoDate(normalizedPreferredDate)) {
    res.status(400).json({ error: "Preferred date cannot be in the past" });
    return;
  }

  const availableSlots = getAvailableSlots(normalizedConsultationType, normalizedPreferredDate);
  if (!availableSlots.includes(normalizedPreferredTimeSlot)) {
    res.status(400).json({ error: "Unsupported time slot for selected consultation" });
    return;
  }

  if (normalizedMessage.length > leadValidation.message.max) {
    res.status(400).json({ error: "Message exceeds allowed length" });
    return;
  }

  if (
    hasDisallowedControlChars(normalizedFullName) ||
    hasDisallowedControlChars(normalizedEmail) ||
    hasDisallowedControlChars(normalizedPhone) ||
    hasDisallowedControlChars(normalizedMessage)
  ) {
    res.status(400).json({ error: "Lead fields contain invalid characters" });
    return;
  }

  const now = Timestamp.now();
  const lead: LeadDocument = {
    fullName: normalizedFullName,
    email: normalizedEmail,
    phone: normalizedPhone,
    serviceType: normalizedServiceType,
    consultationType: normalizedConsultationType,
    preferredDate: normalizedPreferredDate,
    preferredTimeSlot: normalizedPreferredTimeSlot,
    message: normalizedMessage,
    status: "new",
    source: "website",
    createdAt: now,
    updatedAt: now,
    schemaVersion: "v1",
  };

  try {
    const writeTimeoutMs = 12000;
    const docRef = (await Promise.race([
      db.collection("leads").add(lead),
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error("LEAD_WRITE_TIMEOUT")), writeTimeoutMs);
      }),
    ])) as DocumentReference;

    res.status(201).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("Failed to save lead", error);

    if (error instanceof Error && error.message === "LEAD_WRITE_TIMEOUT") {
      res.status(503).json({ error: "Lead save timed out. Please retry shortly." });
      return;
    }

    res.status(500).json({ error: "Failed to save lead" });
  }
});

app.post(["/estimates", "/api/estimates"], (req: Request, res: Response) => {
  const { serviceType, projectSize, condition } = req.body ?? {};

  const normalizedServiceType = String(serviceType ?? "").trim();
  const normalizedProjectSize = String(projectSize ?? "").trim();
  const normalizedCondition = String(condition ?? "").trim();

  if (!allowedServiceTypes.includes(normalizedServiceType as (typeof allowedServiceTypes)[number])) {
    res.status(400).json({ error: "Unsupported service type" });
    return;
  }

  if (!allowedProjectSizes.includes(normalizedProjectSize as (typeof allowedProjectSizes)[number])) {
    res.status(400).json({ error: "Unsupported project size" });
    return;
  }

  if (!allowedConditions.includes(normalizedCondition as (typeof allowedConditions)[number])) {
    res.status(400).json({ error: "Unsupported surface condition" });
    return;
  }

  const range = calculateEstimateRange({
    serviceType: normalizedServiceType,
    projectSize: normalizedProjectSize,
    condition: normalizedCondition,
  });

  res.status(200).json({
    ok: true,
    currency: "CAD",
    low: range.low,
    high: range.high,
    note: "Final pricing is confirmed after consultation.",
  });
});

app.get(["/slots", "/api/slots"], (req: Request, res: Response) => {
  const consultationType = String(req.query.consultationType ?? "").trim();
  const preferredDate = String(req.query.preferredDate ?? "").trim();

  if (
    !allowedConsultationTypes.includes(
      consultationType as (typeof allowedConsultationTypes)[number],
    )
  ) {
    res.status(400).json({ error: "Unsupported consultation type" });
    return;
  }

  if (!isValidIsoDate(preferredDate)) {
    res.status(400).json({ error: "Invalid preferred date format" });
    return;
  }

  if (isPastIsoDate(preferredDate)) {
    res.status(200).json({ ok: true, slots: [] });
    return;
  }

  const slots = getAvailableSlots(consultationType, preferredDate || undefined);
  res.status(200).json({ ok: true, slots });
});

app.get(["/admin/leads", "/api/admin/leads"], async (req: AuthenticatedRequest, res: Response) => {
  if (!(await requireAdmin(req, res))) {
    return;
  }

  const status = String(req.query.status ?? "").trim();
  const limit = normalizePositiveLimit(String(req.query.limit ?? "25"));

  if (status && !allowedLeadStatuses.includes(status as (typeof allowedLeadStatuses)[number])) {
    res.status(400).json({ error: "Unsupported lead status filter" });
    return;
  }

  try {
    let query = db.collection("leads").orderBy("createdAt", "desc").limit(limit);
    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const leads = snapshot.docs.map((doc) =>
      serializeLead(doc.data() as Record<string, unknown>, doc.id),
    );

    res.status(200).json({ ok: true, count: leads.length, leads });
  } catch (error) {
    console.error("Failed to list leads", error);
    res.status(500).json({ error: "Failed to list leads" });
  }
});

app.patch(
  ["/admin/leads/:leadId/status", "/api/admin/leads/:leadId/status"],
  async (req: AuthenticatedRequest, res: Response) => {
    if (!(await requireAdmin(req, res))) {
      return;
    }

    const leadId = String(req.params.leadId ?? "").trim();
    const nextStatus = String(req.body?.status ?? "").trim();

    if (!leadId) {
      res.status(400).json({ error: "Lead id is required" });
      return;
    }

    if (!allowedLeadStatuses.includes(nextStatus as (typeof allowedLeadStatuses)[number])) {
      res.status(400).json({ error: "Unsupported lead status" });
      return;
    }

    const leadRef = db.collection("leads").doc(leadId);

    try {
      const snapshot = await leadRef.get();
      if (!snapshot.exists) {
        res.status(404).json({ error: "Lead not found" });
        return;
      }

      await leadRef.update({
        status: nextStatus,
        updatedAt: Timestamp.now(),
        updatedBy: req.userId ?? "system",
      });

      res.status(200).json({ ok: true, id: leadId, status: nextStatus });
    } catch (error) {
      console.error("Failed to update lead status", error);
      res.status(500).json({ error: "Failed to update lead status" });
    }
  },
);

app.post(["/admin/seed", "/api/admin/seed"], async (req: AuthenticatedRequest, res: Response) => {
  if (!(await requireAdmin(req, res))) {
    return;
  }

  const adminUserId = String(req.body?.adminUserId ?? req.userId ?? "").trim();
  const adminEmail = String(req.body?.adminEmail ?? "").trim().toLowerCase();
  const dryRun = Boolean(req.body?.dryRun);

  if (!adminUserId) {
    res.status(400).json({ error: "adminUserId is required" });
    return;
  }

  const now = Timestamp.now();
  const seedPayload = buildSeedPayload({
    now,
    adminUserId,
    adminEmail: adminEmail || undefined,
  });

  const writes = [
    ...Object.entries(seedPayload.users).map(([id, data]) => ({ collection: "users", id, data })),
    ...Object.entries(seedPayload.customers).map(([id, data]) => ({ collection: "customers", id, data })),
    ...Object.entries(seedPayload.jobs).map(([id, data]) => ({ collection: "jobs", id, data })),
    ...Object.entries(seedPayload.leads).map(([id, data]) => ({ collection: "leads", id, data })),
  ];

  if (dryRun) {
    res.status(200).json({
      ok: true,
      mode: "dryRun",
      documents: writes.map((write) => `${write.collection}/${write.id}`),
    });
    return;
  }

  try {
    const batch = db.batch();
    for (const write of writes) {
      batch.set(db.collection(write.collection).doc(write.id), write.data, { merge: true });
    }

    await batch.commit();

    res.status(200).json({
      ok: true,
      seededCount: writes.length,
      documents: writes.map((write) => `${write.collection}/${write.id}`),
    });
  } catch (error) {
    console.error("Failed to seed Firestore collections", error);
    res.status(500).json({ error: "Failed to seed Firestore collections" });
  }
});

export const api = onRequest({ region: "us-central1" }, app);
