import cors from "cors";
import express, { Request, Response } from "express";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();

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
    return baseSlots.filter((slot) => ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "Evening Callback"].includes(slot));
  }

  return baseSlots;
}

const allowedProjectSizes = ["small", "medium", "large"] as const;
const allowedConditions = ["light", "standard", "heavy"] as const;

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

const app = express();
const corsHandler = cors({ origin: true });

app.use(express.json());
app.use(corsHandler);

app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: "painting-business-api" });
});

app.post(["/leads", "/api/leads"], async (req: Request, res: Response) => {
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
    !normalizedPreferredTimeSlot
  ) {
    res.status(400).json({ error: "Missing required lead fields" });
    return;
  }

  if (!normalizedEmail.includes("@")) {
    res.status(400).json({ error: "Invalid email format" });
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

  const availableSlots = getAvailableSlots(normalizedConsultationType, normalizedPreferredDate);
  if (!availableSlots.includes(normalizedPreferredTimeSlot)) {
    res.status(400).json({ error: "Unsupported time slot for selected consultation" });
    return;
  }

  if (normalizedMessage.length > 1500) {
    res.status(400).json({ error: "Message exceeds allowed length" });
    return;
  }

  const now = Timestamp.now();
  const lead = {
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
  };

  try {
    const docRef = await db.collection("leads").add(lead);
    res.status(201).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("Failed to save lead", error);
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

export const api = onRequest({ region: "us-central1" }, app);
