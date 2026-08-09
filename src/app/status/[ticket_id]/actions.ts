"use server";

import { prisma } from "@/lib/prisma";
import {
  uploadFile,
  downloadFileAsBase64,
  getGeneratedContractFolder,
  getBorrowerArchiveFolder,
  getOrCreateFolder,
} from "@/lib/drive";
import {
  buildContractHTML,
  headerTemplate,
  footerTemplate,
} from "@/lib/contract-pdf";
import { getBrowser } from "@/lib/contract-pdf";
import {
  daysBetween,
  driveTimestamp,
  escapeHtml,
  todayInJakarta,
} from "@/lib/format";
import { RequestData } from "./types";
import { sendEmail } from "@/lib/mail";
import { accessCodeLimiter } from "@/lib/rate-limit";
import { z } from "zod";
import {
  validateDocumentUpload,
  validateImageUpload,
} from "@/lib/file-validation";

type VerifyResult =
  | { success: true; request: RequestData }
  | { success: false; error: string };

type DownloadResult =
  | { success: true; dataUrl: string; fileName: string }
  | { success: false; error: string };

type Stage2State = {
  success: boolean;
  error: string | null;
};

type UploadState = {
  success: boolean;
  error: string | null;
};

type AddendumState = {
  success: boolean;
  error: string | null;
};

type ExtensionState = {
  success: boolean;
  error: string | null;
};

function computeCanExtend(status: string, dueDate: Date | null): boolean {
  if (status !== "active" || !dueDate) return false;
  const daysUntilDue = daysBetween(todayInJakarta(), dueDate);
  return daysUntilDue >= 0 && daysUntilDue <= 30;
}

async function requireTicketAccess(ticketId: string, accessCode: string) {
  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
  });

  if (!request || request.accessCode !== accessCode) {
    throw new Error("Invalid access code.");
  }
  return request;
}

export async function verifyAccessCode(
  ticketId: string,
  code: string,
): Promise<VerifyResult> {
  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
    select: {
      id: true,
      ticketId: true,
      accessCode: true,
      borrowerName: true,
      status: true,
      instrumentTypeRequested: true,
      instrumentConfirmed: true,
      borrowerKtpNumber: true,
      borrowerAddressKtp: true,
      borrowerAddressDomicile: true,
      borrowerFaculty: true,
      guardianName: true,
      guardianPhone: true,
      guardianAddressKtp: true,
    },
  });

  if (!request || request.accessCode !== code) {
    const { success } = await accessCodeLimiter.limit(
      `access-code:${ticketId}`,
    );
    return {
      success: false,
      error: success
        ? "Invalid access code."
        : "Too many attempts. Please try again in a few minutes.",
    };
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });
  const hasInitialAddendum = latestPeriod
    ? (await prisma.addendum.count({
        where: { periodId: latestPeriod.id, timing: "initial" },
      })) > 0
    : false;

  const needsExtensionDocuments =
    latestPeriod?.periodType === "extension"
      ? (await prisma.document.count({
          where: { periodId: latestPeriod.id, type: "signed_contract" },
        })) === 0
      : false;

  const canFillExtensionAddendum =
    latestPeriod?.periodType === "extension" && !hasInitialAddendum
      ? (await prisma.document.count({
          where: {
            periodId: latestPeriod.id,
            type: "signed_contract",
            reviewStatus: "approved",
          },
        })) > 0
      : false;

  const hasFinalAddendum = latestPeriod
    ? (await prisma.addendum.count({
        where: { periodId: latestPeriod.id, timing: "final" },
      })) > 0
    : false;

  const isExtensionPeriod = latestPeriod?.periodType === "extension";

  const dueDate = latestPeriod?.dueDate ?? null;
  const canExtend = computeCanExtend(request.status, dueDate);

  const { accessCode, id, ...safeData } = request;
  return {
    success: true,
    request: {
      ...safeData,
      hasInitialAddendum,
      hasFinalAddendum,
      dueDate,
      canExtend,
      needsExtensionDocuments,
      canFillExtensionAddendum,
      isExtensionPeriod,
    },
  };
}

const contractDataSchema = z.object({
  ktpNumber: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "KTP number must be 16 digits"),
  addressKtp: z.string().trim().min(1, "KTP address is required").max(300),
  addressDomicile: z
    .string()
    .trim()
    .min(1, "Domicile address is required")
    .max(300),
  faculty: z
    .string()
    .trim()
    .max(100, "Faculty/major must be 100 characters or fewer")
    .regex(
      /^[^/]+\/[^/]+$/,
      "Format must be Faculty/Major, e.g. FMIPA/Biologi",
    ),
  guardianName: z.string().trim().min(1, "Guardian name is required").max(100),
  guardianPhone: z.string().trim().min(1, "Guardian phone is required").max(20),
  guardianAddressKtp: z
    .string()
    .trim()
    .min(1, "Guardian KTP address is required")
    .max(300),
});

const addendumDataSchema = z.object({
  completeness: z.string().trim().min(1, "Completeness is required").max(500),
  bodyCondition: z
    .string()
    .trim()
    .min(1, "Body condition is required")
    .max(1000),
  accessoriesCondition: z.string().trim().max(1000).nullable(),
  notes: z.string().trim().max(1000).nullable(),
});

export async function submitStage2(
  ticketId: string,
  accessCode: string,
  prevState: Stage2State,
  formData: FormData,
): Promise<Stage2State> {
  let request;

  try {
    request = await requireTicketAccess(ticketId, accessCode);
  } catch {
    return { success: false, error: "Invalid access code." };
  }

  if (request.status !== "reviewing" || !request.instrumentConfirmed) {
    return { success: false, error: "This request is not ready for Stage 2." };
  }

  if (!request.instrumentId) {
    return { success: false, error: "No instrument assigned yet." };
  }

  const parsed = contractDataSchema.safeParse({
    ktpNumber: formData.get("ktpNumber"),
    addressKtp: formData.get("addressKtp"),
    addressDomicile: formData.get("addressDomicile"),
    faculty: formData.get("faculty"),
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
    guardianAddressKtp: formData.get("guardianAddressKtp"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const {
    ktpNumber,
    addressKtp,
    addressDomicile,
    faculty,
    guardianName,
    guardianPhone,
    guardianAddressKtp,
  } = parsed.data;

  const [instrument, settings] = await Promise.all([
    prisma.instrument.findUniqueOrThrow({
      where: { id: request.instrumentId },
    }),
    prisma.loanSetting.findFirstOrThrow(),
  ]);

  const signatoryImageBase64 = settings.signatoryImageDriveId
    ? await downloadFileAsBase64(settings.signatoryImageDriveId, "image/png")
    : null;

  const html = await buildContractHTML({
    signatory: {
      name: settings.signatoryName,
      phone: settings.signatoryPhone,
      addressKtp: settings.signatoryAddressKtp,
      addressDomicile: settings.signatoryAddressDomicile,
      faculty: settings.signatoryFaculty,
      year: settings.signatoryYear,
      section: settings.signatorySection,
      ktpNumber: settings.signatoryKtpNumber,
      imageBase64: signatoryImageBase64,
    },
    borrower: {
      name: request.borrowerName,
      phone: request.borrowerPhone,
      addressKtp,
      addressDomicile,
      faculty,
      year: request.borrowerYear,
      ktpNumber,
    },
    guardian: {
      name: guardianName,
      phone: guardianPhone,
      addressKtp: guardianAddressKtp,
    },
    instrumentLabel: `${instrument.section}/${instrument.type}`,
    instrumentType: instrument.type,
    depositAmount: settings.depositAmount,
    depositPartialAmount: settings.depositPartialAmount,
    depositGraceDays: settings.depositGraceDays,
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    bankHolder: settings.bankHolder,
    dueDate: settings.dueDate,
  });

  const browser = await getBrowser();
  let pdfBuffer: Buffer;

  try {
    const page = await browser.newPage();
    await page.setContent(html);

    pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: { top: "200px", bottom: "110px", left: "70px", right: "70px" },
      }),
    );
  } finally {
    await browser.close();
  }

  const year = new Date().getFullYear();
  const folderId = await getGeneratedContractFolder(year);
  const driveFileId = await uploadFile(
    `Kontrak ${request.borrowerName}_${request.ticketId}.pdf`,
    "application/pdf",
    Buffer.from(pdfBuffer),
    folderId,
  );

  await prisma.$transaction([
    prisma.borrowingRequest.update({
      where: { ticketId },
      data: {
        borrowerKtpNumber: ktpNumber,
        borrowerAddressKtp: addressKtp,
        borrowerAddressDomicile: addressDomicile,
        borrowerFaculty: faculty,
        guardianName,
        guardianPhone,
        guardianAddressKtp,
        status: "contract_generated",
      },
    }),
    prisma.loanPeriod.create({
      data: {
        requestId: request.id,
        periodType: "initial",
        sequence: 1,
        dueDate: settings.dueDate,
        contractDriveFileId: driveFileId,
      },
    }),
  ]);

  return { success: true, error: null };
}

export async function submitExtension(
  ticketId: string,
  accessCode: string,
  prevState: ExtensionState,
  formData: FormData,
): Promise<ExtensionState> {
  let request;

  try {
    request = await requireTicketAccess(ticketId, accessCode);
  } catch {
    return { success: false, error: "Invalid access code." };
  }

  if (request.status !== "active" || !request.instrumentId) {
    return {
      success: false,
      error: "This request is not eligible for extension.",
    };
  }

  const parsed = contractDataSchema.safeParse({
    ktpNumber: formData.get("ktpNumber"),
    addressKtp: formData.get("addressKtp"),
    addressDomicile: formData.get("addressDomicile"),
    faculty: formData.get("faculty"),
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
    guardianAddressKtp: formData.get("guardianAddressKtp"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const {
    ktpNumber,
    addressKtp,
    addressDomicile,
    faculty,
    guardianName,
    guardianPhone,
    guardianAddressKtp,
  } = parsed.data;

  const [instrument, settings, latestPeriod] = await Promise.all([
    prisma.instrument.findUniqueOrThrow({
      where: { id: request.instrumentId },
    }),
    prisma.loanSetting.findFirstOrThrow(),
    prisma.loanPeriod.findFirstOrThrow({
      where: { requestId: request.id },
      orderBy: { sequence: "desc" },
    }),
  ]);

  const signatoryImageBase64 = settings.signatoryImageDriveId
    ? await downloadFileAsBase64(settings.signatoryImageDriveId, "image/png")
    : null;

  const html = await buildContractHTML({
    signatory: {
      name: settings.signatoryName,
      phone: settings.signatoryPhone,
      addressKtp: settings.signatoryAddressKtp,
      addressDomicile: settings.signatoryAddressDomicile,
      faculty: settings.signatoryFaculty,
      year: settings.signatoryYear,
      section: settings.signatorySection,
      ktpNumber: settings.signatoryKtpNumber,
      imageBase64: signatoryImageBase64,
    },
    borrower: {
      name: request.borrowerName,
      phone: request.borrowerPhone,
      addressKtp,
      addressDomicile,
      faculty,
      year: request.borrowerYear,
      ktpNumber,
    },
    guardian: {
      name: guardianName,
      phone: guardianPhone,
      addressKtp: guardianAddressKtp,
    },
    instrumentLabel: `${instrument.section}/${instrument.type}`,
    instrumentType: instrument.type,
    depositAmount: settings.depositAmount,
    depositPartialAmount: settings.depositPartialAmount,
    depositGraceDays: settings.depositGraceDays,
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    bankHolder: settings.bankHolder,
    dueDate: settings.dueDate,
  });

  const browser = await getBrowser();
  let pdfBuffer: Buffer;

  try {
    const page = await browser.newPage();
    await page.setContent(html);

    pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: { top: "200px", bottom: "110px", left: "70px", right: "70px" },
      }),
    );
  } finally {
    await browser.close();
  }

  const nextSequence = latestPeriod.sequence + 1;
  const year = new Date().getFullYear();
  const folderId = await getGeneratedContractFolder(year);
  const driveFileId = await uploadFile(
    `Kontrak ${request.borrowerName}_${request.ticketId}_Ext${nextSequence}.pdf`,
    "application/pdf",
    Buffer.from(pdfBuffer),
    folderId,
  );

  await prisma.$transaction([
    prisma.borrowingRequest.update({
      where: { ticketId },
      data: {
        borrowerKtpNumber: ktpNumber,
        borrowerAddressKtp: addressKtp,
        borrowerAddressDomicile: addressDomicile,
        borrowerFaculty: faculty,
        guardianName,
        guardianPhone,
        guardianAddressKtp,
      },
    }),
    prisma.loanPeriod.create({
      data: {
        requestId: request.id,
        periodType: "extension",
        sequence: nextSequence,
        dueDate: settings.dueDate,
        contractDriveFileId: driveFileId,
      },
    }),
  ]);

  return { success: true, error: null };
}

export async function getContractPdf(
  ticketId: string,
  accessCode: string,
): Promise<DownloadResult> {
  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
    select: { id: true, accessCode: true, borrowerName: true },
  });

  if (!request || request.accessCode !== accessCode) {
    return { success: false, error: "Invalid access code." };
  }

  const period = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });

  if (!period?.contractDriveFileId) {
    return { success: false, error: "Contract PDF not found." };
  }

  const dataUrl = await downloadFileAsBase64(
    period.contractDriveFileId,
    "application/pdf",
  );

  const fileName =
    period.periodType === "extension"
      ? `Kontrak ${request.borrowerName}_${ticketId}_Ext${period.sequence}.pdf`
      : `Kontrak ${request.borrowerName}_${ticketId}.pdf`;

  return {
    success: true,
    dataUrl,
    fileName,
  };
}

export async function submitDocuments(
  ticketId: string,
  accessCode: string,
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  let request;

  try {
    request = await requireTicketAccess(ticketId, accessCode);
  } catch {
    return { success: false, error: "Invalid access code." };
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });

  if (!latestPeriod) {
    return { success: false, error: "No loan period found." };
  }

  const isExtension = latestPeriod.periodType === "extension";

  if (isExtension) {
    if (request.status !== "active") {
      return { success: false, error: "Not ready for document upload." };
    }
  } else {
    if (request.status !== "contract_generated") {
      return { success: false, error: "Not ready for document upload." };
    }
  }

  const signedContract = formData.get("signedContract") as File;
  if (!signedContract?.size) {
    return { success: false, error: "Signed contract is required." };
  }

  const uploads: {
    type: "signed_contract" | "deposit_proof" | "ktp_scan";
    file: File;
  }[] = [{ type: "signed_contract", file: signedContract }];

  if (isExtension) {
    const ktpScan = formData.get("ktpScan") as File | null;
    if (ktpScan?.size) {
      uploads.push({ type: "ktp_scan", file: ktpScan });
    }
  } else {
    const depositProof = formData.get("depositProof") as File;
    const ktpScan = formData.get("ktpScan") as File;
    if (!depositProof?.size || !ktpScan?.size) {
      return { success: false, error: "All 3 documents are required." };
    }
    uploads.push(
      { type: "deposit_proof", file: depositProof },
      { type: "ktp_scan", file: ktpScan },
    );
  }

  const VALIDATORS: Record<
    "signed_contract" | "deposit_proof" | "ktp_scan",
    typeof validateDocumentUpload
  > = {
    signed_contract: validateDocumentUpload,
    deposit_proof: validateImageUpload,
    ktp_scan: validateDocumentUpload,
  };

  const validatedUploads: {
    type: "signed_contract" | "deposit_proof" | "ktp_scan";
    file: File;
    mimeType: string;
  }[] = [];

  for (const { type, file } of uploads) {
    const validation = await VALIDATORS[type](file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    validatedUploads.push({ type, file, mimeType: validation.mimeType });
  }

  const year = new Date().getFullYear();
  const folderId = await getBorrowerArchiveFolder(
    year,
    ticketId,
    request.borrowerName,
  );

  const documentsData = [];
  for (const { type, file, mimeType } of validatedUploads) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const driveFileId = await uploadFile(
      `${type}_${request.borrowerName}_${driveTimestamp()}.${ext}`,
      mimeType,
      buffer,
      folderId,
    );
    documentsData.push({
      periodId: latestPeriod.id,
      type,
      driveFileId,
      mimeType,
    });
  }

  if (isExtension) {
    await prisma.document.createMany({ data: documentsData });
  } else {
    await prisma.$transaction([
      prisma.document.createMany({ data: documentsData }),
      prisma.borrowingRequest.update({
        where: { ticketId },
        data: { status: "documents_uploaded" },
      }),
    ]);
  }

  await sendEmail({
    to: process.env.GMAIL_USER!,
    subject: isExtension
      ? `Dokumen perpanjangan menunggu review — tiket ${request.ticketId}`
      : `Dokumen baru menunggu review — tiket ${request.ticketId}`,
    html: `
    <p>Peminjam ${escapeHtml(request.borrowerName)} (tiket ${request.ticketId}) sudah meng-upload ${isExtension ? "kontrak perpanjangan yang sudah ditandatangani" : "dokumen kontrak"}.</p>
    <p><a href="${process.env.BETTER_AUTH_URL}/admin/requests/${request.id}">Buka detail request</a></p>
  `,
  });

  return { success: true, error: null };
}

export async function submitAddendum(
  ticketId: string,
  accessCode: string,
  timing: "initial" | "final",
  prevState: AddendumState,
  formData: FormData,
): Promise<AddendumState> {
  try {
    await requireTicketAccess(ticketId, accessCode);
  } catch {
    return { success: false, error: "Invalid access code." };
  }

  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { ticketId },
    include: { instrument: true },
  });

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });
  if (!latestPeriod) {
    return { success: false, error: "No loan period found." };
  }

  if (timing === "final") {
    if (request.status !== "active" && request.status !== "overdue") {
      return {
        success: false,
        error: "This request is not eligible for return.",
      };
    }
    const existingFinal = await prisma.addendum.findFirst({
      where: { periodId: latestPeriod.id, timing: "final" },
    });
    if (existingFinal) {
      return {
        success: false,
        error: "Final addendum already submitted for this period.",
      };
    }
  } else {
    const isExtension = latestPeriod.periodType === "extension";

    if (isExtension) {
      if (request.status !== "active") {
        return {
          success: false,
          error: "This request is not ready for addendum.",
        };
      }
      const signedContract = await prisma.document.findFirst({
        where: { periodId: latestPeriod.id, type: "signed_contract" },
      });
      if (!signedContract || signedContract.reviewStatus !== "approved") {
        return {
          success: false,
          error: "Your signed contract is still being reviewed.",
        };
      }
    } else {
      if (request.status !== "ready_to_pickup") {
        return {
          success: false,
          error: "This request is not ready for addendum.",
        };
      }
    }
  }

  const confirmedTruthful = formData.get("confirmedTruthful") === "on";
  if (!confirmedTruthful) {
    return {
      success: false,
      error: "You must confirm the condition data is truthful.",
    };
  }

  const parsed = addendumDataSchema.safeParse({
    completeness: formData.get("completeness"),
    bodyCondition: formData.get("bodyCondition"),
    accessoriesCondition: formData.get("accessoriesCondition") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { completeness, bodyCondition, accessoriesCondition, notes } =
    parsed.data;

  const year = new Date().getFullYear();
  const archiveFolder = await getBorrowerArchiveFolder(
    year,
    ticketId,
    request.borrowerName,
  );
  const addendumFolder = await getOrCreateFolder(
    timing === "initial" ? "Addendum_Awal" : "Addendum_Akhir",
    archiveFolder,
  );

  const photos = formData.getAll("photos") as File[];

  const validatedPhotos: { file: File; mimeType: string }[] = [];
  for (const photo of photos) {
    if (photo.size === 0) continue;
    const validation = await validateImageUpload(photo);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    validatedPhotos.push({ file: photo, mimeType: validation.mimeType });
  }

  const driveFileIds: string[] = [];
  for (const [index, { file, mimeType }] of validatedPhotos.entries()) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const driveFileId = await uploadFile(
      `Kondisi_${request.borrowerName}_${driveTimestamp()}_${index + 1}.${ext}`,
      mimeType,
      buffer,
      addendumFolder,
    );
    driveFileIds.push(driveFileId);
  }

  await prisma.addendum.create({
    data: {
      periodId: latestPeriod.id,
      timing,
      instrumentType:
        request.instrument?.type ?? request.instrumentTypeRequested,
      instrumentBrand: request.instrument?.brand,
      instrumentSerial: request.instrument?.serialNumber,
      completeness,
      bodyCondition,
      accessoriesCondition,
      driveFileIds,
      confirmedTruthful: true,
      notes,
    },
  });

  return { success: true, error: null };
}
