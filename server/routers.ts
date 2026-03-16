import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { 
  createClinic, 
  getClinicByEmail, 
  verifyClinic, 
  createClinicStaff,
  getClinicStaffByEmail,
  getClinicStaffById,
  createPatient,
  getPatientsByClinicId,
  createReferral,
  getReferralsByPatientId,
  getReferralsByClinicAndType,
  updateReferralStatus,
  createNotification,
  getNotificationsByStaffId,
  markNotificationAsRead,
  getClinicById,
  getPatientById,
  getReferralById,
} from "./db";
import { sendVerificationEmail, sendNewReferralEmail } from "./email";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  clinic: router({
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          phone: z.string().min(1),
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        const existingClinic = await getClinicByEmail(input.email);
        if (existingClinic) {
          throw new Error("Clinic with this email already exists");
        }

        const verificationCode = Math.random().toString().slice(2, 8);

        const result = await createClinic({
          name: input.name,
          phone: input.phone,
          email: input.email,
          ownerUserId: 0,
          verificationCode,
        });

        await sendVerificationEmail(input.email, input.name, verificationCode);

        return {
          success: true,
          message: "Verification code sent to your email",
        };
      }),

    verify: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          verificationCode: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const clinic = await getClinicByEmail(input.email);
        if (!clinic) {
          throw new Error("Clinic not found");
        }

        if (clinic.verificationCode !== input.verificationCode) {
          throw new Error("Invalid verification code");
        }

        if (clinic.verificationCodeExpiresAt && clinic.verificationCodeExpiresAt < new Date()) {
          throw new Error("Verification code expired");
        }

        await verifyClinic(clinic.id);

        return {
          success: true,
          clinicId: clinic.id,
          message: "Clinic verified successfully",
        };
      }),

    getById: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return await getClinicById(input.clinicId);
      }),
  }),

  staff: router({
    register: publicProcedure
      .input(
        z.object({
          clinicId: z.number(),
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["doctor", "lab_technician", "radiologist", "pharmacist"]),
        })
      )
      .mutation(async ({ input }) => {
        const existingStaff = await getClinicStaffByEmail(input.clinicId, input.email);
        if (existingStaff) {
          throw new Error("Staff member with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        await createClinicStaff({
          clinicId: input.clinicId,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
        });

        return {
          success: true,
          message: "Staff member registered successfully",
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          clinicId: z.number(),
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const staff = await getClinicStaffByEmail(input.clinicId, input.email);
        if (!staff) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(input.password, staff.password);
        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          success: true,
          staff: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            clinicId: staff.clinicId,
          },
        };
      }),

    getById: publicProcedure
      .input(z.object({ staffId: z.number() }))
      .query(async ({ input }) => {
        return await getClinicStaffById(input.staffId);
      }),
  }),

  patient: router({
    create: publicProcedure
      .input(
        z.object({
          clinicId: z.number(),
          name: z.string().min(1),
          age: z.number().optional(),
          gender: z.enum(["male", "female"]).optional(),
          chronicDiseases: z.string().optional(),
          medicalHistory: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createPatient(input);
        return {
          success: true,
          message: "Patient created successfully",
        };
      }),

    getByClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return await getPatientsByClinicId(input.clinicId);
      }),

    getById: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await getPatientById(input.patientId);
      }),
  }),

  referral: router({
    create: publicProcedure
      .input(
        z.object({
          clinicId: z.number(),
          patientId: z.number(),
          doctorId: z.number(),
          type: z.enum(["lab_test", "radiology", "prescription"]),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const referral = await createReferral(input);
        const patient = await getPatientById(input.patientId);
        const doctor = await getClinicStaffById(input.doctorId);

        if (doctor) {
          await sendNewReferralEmail(
            doctor.email,
            doctor.name,
            patient?.name || "Unknown",
            input.type,
            input.clinicId
          );
        }

        return {
          success: true,
          message: "Referral created successfully",
        };
      }),

    getByPatient: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await getReferralsByPatientId(input.patientId);
      }),

    getByClinicAndType: publicProcedure
      .input(z.object({ clinicId: z.number(), type: z.string() }))
      .query(async ({ input }) => {
        return await getReferralsByClinicAndType(input.clinicId, input.type);
      }),

    updateStatus: publicProcedure
      .input(
        z.object({
          referralId: z.number(),
          status: z.enum(["pending", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateReferralStatus(input.referralId, input.status);
        return {
          success: true,
          message: "Referral status updated successfully",
        };
      }),

    getById: publicProcedure
      .input(z.object({ referralId: z.number() }))
      .query(async ({ input }) => {
        return await getReferralById(input.referralId);
      }),
  }),

  notification: router({
    getByStaff: publicProcedure
      .input(z.object({ staffId: z.number() }))
      .query(async ({ input }) => {
        return await getNotificationsByStaffId(input.staffId);
      }),

    markAsRead: publicProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return {
          success: true,
          message: "Notification marked as read",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
