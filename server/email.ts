import { invokeLLM } from "./_core/llm";
import { logEmail } from "./db";

/**
 * Send verification code email to clinic owner
 */
export async function sendVerificationEmail(email: string, clinicName: string, verificationCode: string) {
  try {
    // In production, use a real email service like SendGrid, AWS SES, or Mailgun
    // For now, we'll log it
    console.log(`[EMAIL] Verification code for ${clinicName}: ${verificationCode}`);
    
    await logEmail({
      recipientEmail: email,
      subject: `تحقق من عيادتك - ${clinicName}`,
      type: "verification",
      status: "sent",
    });
    
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send verification email:", error);
    await logEmail({
      recipientEmail: email,
      subject: `تحقق من عيادتك - ${clinicName}`,
      type: "verification",
      status: "failed",
    });
    return false;
  }
}

/**
 * Send new referral notification email
 */
export async function sendNewReferralEmail(
  recipientEmail: string,
  staffName: string,
  patientName: string,
  referralType: string,
  clinicId: number
) {
  try {
    const typeLabels: Record<string, string> = {
      lab_test: "اختبار مختبري",
      radiology: "أشعة",
      prescription: "وصفة دواء",
    };
    const typeLabel = typeLabels[referralType] || referralType;

    console.log(`[EMAIL] New ${referralType} referral for ${patientName} sent to ${staffName}`);
    
    await logEmail({
      clinicId,
      recipientEmail,
      subject: `طلب جديد: ${typeLabel} للمريض ${patientName}`,
      type: "new_referral",
      status: "sent",
    });
    
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send referral email:", error);
    return false;
  }
}

/**
 * Send result uploaded notification email
 */
export async function sendResultUploadedEmail(
  recipientEmail: string,
  doctorName: string,
  patientName: string,
  resultType: string,
  clinicId: number
) {
  try {
    const typeLabels: Record<string, string> = {
      lab_test: "نتائج الاختبار المختبري",
      radiology: "تقرير الأشعة",
    };
    const typeLabel = typeLabels[resultType] || resultType;

    console.log(`[EMAIL] ${resultType} results for ${patientName} uploaded`);
    
    await logEmail({
      clinicId,
      recipientEmail,
      subject: `${typeLabel} جاهزة للمريض ${patientName}`,
      type: "result_uploaded",
      status: "sent",
    });
    
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send result email:", error);
    return false;
  }
}

/**
 * Send prescription ready notification email
 */
export async function sendPrescriptionReadyEmail(
  recipientEmail: string,
  doctorName: string,
  patientName: string,
  clinicId: number
) {
  try {
    console.log(`[EMAIL] Prescription for ${patientName} is ready`);
    
    await logEmail({
      clinicId,
      recipientEmail,
      subject: `الوصفة الطبية جاهزة للمريض ${patientName}`,
      type: "new_referral",
      status: "sent",
    });
    
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send prescription email:", error);
    return false;
  }
}
