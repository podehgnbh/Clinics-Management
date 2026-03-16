import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clinics, clinicStaff, patients, referrals, labResults, radiologyReports, prescriptions, notifications, emailLogs, Clinic, ClinicStaff, Patient, Referral } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Clinic Queries ============

export async function createClinic(data: { name: string; phone: string; email: string; ownerUserId: number; verificationCode: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clinics).values({
    ...data,
    verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });
  return result;
}

export async function getClinicByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clinics).where(eq(clinics.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClinicById(clinicId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function verifyClinic(clinicId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clinics).set({ isVerified: true, verificationCode: null, verificationCodeExpiresAt: null }).where(eq(clinics.id, clinicId));
}

// ============ Clinic Staff Queries ============

export async function createClinicStaff(data: { clinicId: number; name: string; email: string; password: string; role: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clinicStaff).values(data as any);
  return result;
}

export async function getClinicStaffByEmail(clinicId: number, email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clinicStaff).where(and(eq(clinicStaff.clinicId, clinicId), eq(clinicStaff.email, email))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClinicStaffById(staffId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clinicStaff).where(eq(clinicStaff.id, staffId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClinicStaffByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clinicStaff).where(eq(clinicStaff.clinicId, clinicId));
}

// ============ Patient Queries ============

export async function createPatient(data: { clinicId: number; name: string; age?: number; gender?: string; chronicDiseases?: string; medicalHistory?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(patients).values(data as any);
  return result;
}

export async function getPatientById(patientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPatientsByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(patients).where(eq(patients.clinicId, clinicId));
}

// ============ Referral Queries ============

export async function createReferral(data: { clinicId: number; patientId: number; doctorId: number; type: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(referrals).values(data as any);
  return result;
}

export async function getReferralById(referralId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(referrals).where(eq(referrals.id, referralId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReferralsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(referrals).where(eq(referrals.patientId, patientId));
}

export async function getReferralsByClinicAndType(clinicId: number, type: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(referrals).where(and(eq(referrals.clinicId, clinicId), eq(referrals.type, type as any)));
}

export async function updateReferralStatus(referralId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const completedAt = status === 'completed' ? new Date() : null;
  await db.update(referrals).set({ status: status as any, completedAt }).where(eq(referrals.id, referralId));
}

// ============ Notification Queries ============

export async function createNotification(data: { clinicId: number; staffId: number; title: string; message?: string; type: string; referralId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(data as any);
  return result;
}

export async function getNotificationsByStaffId(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notifications).where(eq(notifications.staffId, staffId));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

// ============ Lab Result Queries ============

export async function createLabResult(data: { clinicId: number; referralId: number; testName: string; resultPdfUrl?: string; resultPdfKey?: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(labResults).values(data as any);
  return result;
}

export async function getLabResultByReferralId(referralId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(labResults).where(eq(labResults.referralId, referralId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Radiology Report Queries ============

export async function createRadiologyReport(data: { clinicId: number; referralId: number; examType: string; reportPdfUrl?: string; reportPdfKey?: string; findings?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(radiologyReports).values(data as any);
  return result;
}

export async function getRadiologyReportByReferralId(referralId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(radiologyReports).where(eq(radiologyReports.referralId, referralId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Email Log Queries ============

export async function logEmail(data: { clinicId?: number; recipientEmail: string; subject: string; type: string; status: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(emailLogs).values(data as any);
  return result;
}
