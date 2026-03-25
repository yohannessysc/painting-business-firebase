import cors from "cors";
import express, { Request, Response } from "express";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();

const app = express();
const corsHandler = cors({ origin: true });

app.use(express.json());
app.use(corsHandler);

app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: "painting-business-api" });
});

app.post(["/leads", "/api/leads"], async (req: Request, res: Response) => {
  const { fullName, email, phone, serviceType, message } = req.body ?? {};

  if (!fullName || !email || !phone || !serviceType) {
    res.status(400).json({ error: "Missing required lead fields" });
    return;
  }

  const now = Timestamp.now();
  const lead = {
    fullName,
    email,
    phone,
    serviceType,
    message: message ?? "",
    status: "new",
    source: "website",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = await db.collection("leads").add(lead);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to save lead", error);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

export const api = onRequest({ region: "us-central1" }, app);
