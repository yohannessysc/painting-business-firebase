import { Timestamp } from "firebase-admin/firestore";

export const schemaVersion = "v1" as const;

export const userRoles = ["admin", "staff"] as const;
export type UserRole = (typeof userRoles)[number];

export const customerStatuses = ["lead", "active", "inactive"] as const;
export type CustomerStatus = (typeof customerStatuses)[number];

export const jobStatuses = ["scheduled", "in_progress", "completed", "cancelled"] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const leadStatuses = ["new", "contacted", "scheduled", "closed"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export type UserDocument = {
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  schemaVersion: typeof schemaVersion;
};

export type CustomerDocument = {
  fullName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  sourceLeadId: string;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  schemaVersion: typeof schemaVersion;
};

export type JobDocument = {
  customerId: string;
  title: string;
  serviceType: string;
  location: string;
  status: JobStatus;
  scheduledDate: string;
  budgetLow: number;
  budgetHigh: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  schemaVersion: typeof schemaVersion;
};

export type LeadDocument = {
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  consultationType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  message: string;
  status: LeadStatus;
  source: "website";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  schemaVersion: typeof schemaVersion;
};

export type SeedPayload = {
  users: Record<string, UserDocument>;
  customers: Record<string, CustomerDocument>;
  jobs: Record<string, JobDocument>;
  leads: Record<string, LeadDocument>;
};

export function buildSeedPayload(input: {
  now: Timestamp;
  adminUserId: string;
  adminEmail?: string;
}): SeedPayload {
  const adminEmail = input.adminEmail?.trim().toLowerCase() || "admin@example.com";

  return {
    users: {
      [input.adminUserId]: {
        email: adminEmail,
        displayName: "Primary Admin",
        role: "admin",
        isActive: true,
        createdAt: input.now,
        updatedAt: input.now,
        schemaVersion,
      },
    },
    customers: {
      "sample-customer-001": {
        fullName: "Sample Customer",
        email: "customer@example.com",
        phone: "+1 555 010 0100",
        status: "lead",
        sourceLeadId: "sample-lead-001",
        notes: "Seed customer for local and staging validation.",
        createdAt: input.now,
        updatedAt: input.now,
        schemaVersion,
      },
    },
    jobs: {
      "sample-job-001": {
        customerId: "sample-customer-001",
        title: "Interior Repaint - Main Floor",
        serviceType: "Interior Painting",
        location: "Toronto, ON",
        status: "scheduled",
        scheduledDate: "2026-04-10",
        budgetLow: 1800,
        budgetHigh: 2600,
        createdAt: input.now,
        updatedAt: input.now,
        schemaVersion,
      },
    },
    leads: {
      "sample-lead-001": {
        fullName: "Sample Lead",
        email: "lead@example.com",
        phone: "+1 555 010 0001",
        serviceType: "Interior Painting",
        consultationType: "Virtual Consultation",
        preferredDate: "2026-04-05",
        preferredTimeSlot: "10:00 AM - 12:00 PM",
        message: "Seed lead created to verify Firestore collection bootstrapping.",
        status: "new",
        source: "website",
        createdAt: input.now,
        updatedAt: input.now,
        schemaVersion,
      },
    },
  };
}
