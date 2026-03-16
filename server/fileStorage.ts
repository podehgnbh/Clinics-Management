import { storagePut, storageGet } from "./storage";
import { createLabResult, createRadiologyReport } from "./db";

/**
 * Upload lab result PDF
 */
export async function uploadLabResultPdf(
  referralId: number,
  clinicId: number,
  testName: string,
  pdfBuffer: Buffer,
  notes?: string
) {
  try {
    const fileKey = `clinic-${clinicId}/lab-results/${referralId}-${Date.now()}.pdf`;
    const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
    
    await createLabResult({
      clinicId,
      referralId,
      testName,
      resultPdfUrl: url,
      resultPdfKey: fileKey,
      notes,
    });
    
    return { url, fileKey };
  } catch (error) {
    console.error("[FileStorage] Failed to upload lab result:", error);
    throw error;
  }
}

/**
 * Upload radiology report PDF
 */
export async function uploadRadiologyReportPdf(
  referralId: number,
  clinicId: number,
  examType: string,
  pdfBuffer: Buffer,
  findings?: string
) {
  try {
    const fileKey = `clinic-${clinicId}/radiology-reports/${referralId}-${Date.now()}.pdf`;
    const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
    
    await createRadiologyReport({
      clinicId,
      referralId,
      examType,
      reportPdfUrl: url,
      reportPdfKey: fileKey,
      findings,
    });
    
    return { url, fileKey };
  } catch (error) {
    console.error("[FileStorage] Failed to upload radiology report:", error);
    throw error;
  }
}

/**
 * Get presigned URL for downloading a file
 */
export async function getDownloadUrl(fileKey: string) {
  try {
    const { url } = await storageGet(fileKey);
    return url;
  } catch (error) {
    console.error("[FileStorage] Failed to get download URL:", error);
    throw error;
  }
}
