import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * This is the Manus OAuth user table - separate from clinic staff.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clinics table - each clinic is a separate tenant
 * Multi-tenant isolation: all data is scoped by clinicId
 */
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  ownerUserId: int("ownerUserId").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  verificationCode: varchar("verificationCode", { length: 6 }),
  verificationCodeExpiresAt: timestamp("verificationCodeExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerUserIdIdx: index("ownerUserIdIdx").on(table.ownerUserId),
}));

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;

/**
 * Clinic staff - employees of each clinic
 * Each staff member belongs to exactly one clinic
 * Roles: doctor, lab_technician, radiologist, pharmacist
 */
export const clinicStaff = mysqlTable("clinicStaff", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["doctor", "lab_technician", "radiologist", "pharmacist"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
  emailIdx: index("emailIdx").on(table.email),
}));

export type ClinicStaff = typeof clinicStaff.$inferSelect;
export type InsertClinicStaff = typeof clinicStaff.$inferInsert;

/**
 * Patients - medical records for each clinic
 * Each patient belongs to exactly one clinic
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female"]),
  chronicDiseases: text("chronicDiseases"), // JSON array of diseases
  medicalHistory: text("medicalHistory"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
}));

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Referrals - requests from doctor to lab, radiology, or pharmacy
 * Status: pending, completed, cancelled
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  type: mysqlEnum("type", ["lab_test", "radiology", "prescription"]).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  assignedToId: int("assignedToId"), // lab tech, radiologist, or pharmacist
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
  patientIdIdx: index("patientIdIdx").on(table.patientId),
  doctorIdIdx: index("doctorIdIdx").on(table.doctorId),
  assignedToIdIdx: index("assignedToIdIdx").on(table.assignedToId),
}));

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Lab Results - results from lab tests
 */
export const labResults = mysqlTable("labResults", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  referralId: int("referralId").notNull(),
  testName: varchar("testName", { length: 255 }).notNull(),
  resultPdfUrl: text("resultPdfUrl"),
  resultPdfKey: varchar("resultPdfKey", { length: 255 }), // S3 key
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
  referralIdIdx: index("referralIdIdx").on(table.referralId),
}));

export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = typeof labResults.$inferInsert;

/**
 * Radiology Reports - reports from radiology
 */
export const radiologyReports = mysqlTable("radiologyReports", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  referralId: int("referralId").notNull(),
  examType: varchar("examType", { length: 255 }).notNull(),
  reportPdfUrl: text("reportPdfUrl"),
  reportPdfKey: varchar("reportPdfKey", { length: 255 }), // S3 key
  findings: text("findings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
  referralIdIdx: index("referralIdIdx").on(table.referralId),
}));

export type RadiologyReport = typeof radiologyReports.$inferSelect;
export type InsertRadiologyReport = typeof radiologyReports.$inferInsert;

/**
 * Prescriptions - medication prescriptions from doctor
 */
export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  referralId: int("referralId").notNull(),
  medications: text("medications"), // JSON array of medications
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
  referralIdIdx: index("referralIdIdx").on(table.referralId),
}));

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;

/**
 * Notifications - in-app notifications for staff
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  staffId: int("staffId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["new_referral", "result_uploaded", "prescription_ready"]).notNull(),
  referralId: int("referralId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
  staffIdIdx: index("staffIdIdx").on(table.staffId),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Email logs - track sent emails for auditing
 */
export const emailLogs = mysqlTable("emailLogs", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["verification", "new_referral", "result_uploaded", "password_reset"]).notNull(),
  status: mysqlEnum("status", ["sent", "failed"]).default("sent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  clinicIdIdx: index("clinicIdIdx").on(table.clinicId),
}));

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;