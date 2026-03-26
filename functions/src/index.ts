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

export const api = onRequest({ region: "us-central1" }, app);
