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
import { driveTimestamp, escapeHtml } from "@/lib/format";
import {
  documentTypesNeedingUpload,
  computeCanExtend,
  requiredDocumentTypesForPeriod,
} from "@/lib/loan-rules";
import { RequestData } from "./types";
import { sendEmail } from "@/lib/mail";
import { accessCodeLimiter } from "@/lib/rate-limit";
import { z } from "zod";
import {
  validateDocumentUpload,
  validateImageUpload,
} from "@/lib/file-validation";
import * as Sentry from "@sentry/nextjs";

type VerifyResult =
  | { success: true; request: RequestData }
  | { success: false; error: string };

type DownloadResult =
  | { success: true; dataUrl: string; fileName: string }
  | { success: false; error: string };

type Stage2State = {
  success: boolean;
  error: string | null;
  generalError: string | null;
};

type UploadState = {
  success: boolean;
  error: string | null;
  generalError: string | null;
};

type AddendumState = {
  success: boolean;
  error: string | null;
  generalError: string | null;
};

type ExtensionState = {
  success: boolean;
  error: string | null;
  generalError: string | null;
};

async function requireTicketAccess(ticketId: string, accessCode: string) {
  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
  });

  if (!request || request.accessCode !== accessCode) {
    throw new Error("Kode akses salah.");
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
      createdAt: true,
      rejectionReason: true,
      cancellationReason: true,
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
        ? "Kode akses salah."
        : "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
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

  const existingDocuments = latestPeriod
    ? await prisma.document.findMany({
        where: { periodId: latestPeriod.id },
        distinct: ["type"],
        orderBy: { uploadedAt: "desc" },
      })
    : [];

  const requiredDocumentTypes =
    requiredDocumentTypesForPeriod(isExtensionPeriod);

  const documentsNeedingUpload = documentTypesNeedingUpload(
    requiredDocumentTypes,
    existingDocuments,
  );

  const uploadedDocumentTypes = existingDocuments
    .filter((d) => d.reviewStatus !== "rejected")
    .map((d) => d.type);

  const needsExtensionDocuments =
    isExtensionPeriod && documentsNeedingUpload.includes("signed_contract");

  const hasPendingExtension = isExtensionPeriod && !latestPeriod?.startDate;

  const dueDate = latestPeriod?.dueDate ?? null;
  const canExtend =
    computeCanExtend(request.status, dueDate) && !hasPendingExtension;

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
      uploadedDocumentTypes,
    },
  };
}

const contractDataSchema = z.object({
  ktpNumber: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "Nomor KTP harus 16 digit"),
  addressKtp: z.string().trim().min(1, "Alamat KTP wajib diisi").max(300),
  addressDomicile: z
    .string()
    .trim()
    .min(1, "Alamat domisili wajib diisi")
    .max(300),
  faculty: z
    .string()
    .trim()
    .max(100, "Fakultas/jurusan maksimal 100 karakter")
    .regex(
      /^[^/]+\/[^/]+$/,
      "Format harus Fakultas/Jurusan, mis. FMIPA/Biologi",
    ),
  guardianName: z.string().trim().min(1, "Nama wali wajib diisi").max(100),
  guardianPhone: z.string().trim().min(1, "Nomor HP wali wajib diisi").max(20),
  guardianAddressKtp: z
    .string()
    .trim()
    .min(1, "Alamat KTP wali wajib diisi")
    .max(300),
});

const addendumDataSchema = z.object({
  completeness: z.string().trim().min(1, "Kelengkapan wajib diisi").max(500),
  bodyCondition: z
    .string()
    .trim()
    .min(1, "Kondisi badan alat wajib diisi")
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
    return {
      success: false,
      error: null,
      generalError: "Kode akses salah.",
    };
  }

  if (request.status !== "reviewing" || !request.instrumentConfirmed) {
    return {
      success: false,
      error: null,
      generalError: "Pengajuan ini belum siap untuk Tahap 2.",
    };
  }

  if (!request.instrumentId) {
    return {
      success: false,
      error: null,
      generalError: "Instrumen belum ditugaskan.",
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
    return {
      success: false,
      error: parsed.error.issues[0].message,
      generalError: null,
    };
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

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.borrowingRequest.findUniqueOrThrow({
        where: { ticketId },
      });

      if (current.status !== "reviewing") {
        throw new Error("Pengajuan ini sudah diproses di tab/perangkat lain.");
      }

      await tx.borrowingRequest.update({
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
      });

      await tx.loanPeriod.create({
        data: {
          requestId: request.id,
          periodType: "initial",
          sequence: 1,
          dueDate: settings.dueDate,
          contractDriveFileId: driveFileId,
        },
      });
    });
  } catch {
    return {
      success: false,
      error: null,
      generalError: "Pengajuan ini sudah diproses di tab/perangkat lain.",
    };
  }

  return { success: true, error: null, generalError: null };
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
    return {
      success: false,
      error: null,
      generalError: "Kode akses salah.",
    };
  }

  if (request.status !== "active" || !request.instrumentId) {
    return {
      success: false,
      error: null,
      generalError: "Pengajuan ini tidak bisa diperpanjang.",
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
    return {
      success: false,
      error: parsed.error.issues[0].message,
      generalError: null,
    };
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

  if (!computeCanExtend(request.status, latestPeriod.dueDate)) {
    return {
      success: false,
      error: null,
      generalError: "Belum masuk periode waktu perpanjangan.",
    };
  }

  if (latestPeriod.periodType === "extension" && !latestPeriod.startDate) {
    return {
      success: false,
      error: null,
      generalError:
        "Perpanjangan untuk pengajuan ini masih menunggu konfirmasi admin.",
    };
  }

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

  return { success: true, error: null, generalError: null };
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
    return { success: false, error: "Kode akses salah." };
  }

  const period = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });

  if (!period?.contractDriveFileId) {
    return { success: false, error: "PDF kontrak tidak ditemukan." };
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

const UPLOAD_VALIDATORS: Record<
  "signed_contract" | "deposit_proof" | "ktp_scan",
  typeof validateDocumentUpload
> = {
  signed_contract: validateDocumentUpload,
  deposit_proof: validateImageUpload,
  ktp_scan: validateDocumentUpload,
};

export async function submitDocument(
  ticketId: string,
  accessCode: string,
  documentType: "signed_contract" | "deposit_proof" | "ktp_scan",
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  let request;

  try {
    request = await requireTicketAccess(ticketId, accessCode);
  } catch {
    return {
      success: false,
      error: null,
      generalError: "Kode akses salah.",
    };
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });

  if (!latestPeriod) {
    return {
      success: false,
      error: null,
      generalError: "Periode peminjaman tidak ditemukan.",
    };
  }

  const isExtension = latestPeriod.periodType === "extension";

  if (isExtension) {
    if (request.status !== "active") {
      return {
        success: false,
        error: null,
        generalError: "Belum siap untuk upload dokumen.",
      };
    }
  } else {
    if (request.status !== "contract_generated") {
      return {
        success: false,
        error: null,
        generalError: "Belum siap untuk upload dokumen.",
      };
    }
  }

  const file = formData.get("file") as File | null;
  if (!file?.size) {
    return { success: false, error: "Silakan pilih file.", generalError: null };
  }

  const validation = await UPLOAD_VALIDATORS[documentType](file);
  if (!validation.valid) {
    return { success: false, error: validation.error, generalError: null };
  }

  const year = new Date().getFullYear();
  const folderId = await getBorrowerArchiveFolder(
    year,
    ticketId,
    request.borrowerName,
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const driveFileId = await uploadFile(
    `${documentType}_${request.borrowerName}_${driveTimestamp()}.${ext}`,
    validation.mimeType,
    buffer,
    folderId,
  );

  const requiredTypesNow = requiredDocumentTypesForPeriod(isExtension);

  const nowComplete = await prisma.$transaction(async (tx) => {
    await tx.document.upsert({
      where: {
        periodId_type: { periodId: latestPeriod.id, type: documentType },
      },
      create: {
        periodId: latestPeriod.id,
        type: documentType,
        driveFileId,
        mimeType: validation.mimeType,
      },
      update: {
        driveFileId,
        mimeType: validation.mimeType,
        reviewStatus: "pending",
        reviewerNotes: null,
        reviewedAt: null,
      },
    });

    const allDocuments = await tx.document.findMany({
      where: { periodId: latestPeriod.id },
    });
    const stillNeeded = documentTypesNeedingUpload(
      requiredTypesNow,
      allDocuments,
    );
    const complete = stillNeeded.length === 0;

    if (complete && !isExtension) {
      await tx.borrowingRequest.update({
        where: { ticketId },
        data: { status: "documents_uploaded" },
      });
    }

    return complete;
  });

  if (nowComplete) {
    try {
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
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return { success: true, error: null, generalError: null };
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
    return {
      success: false,
      error: null,
      generalError: "Kode akses salah.",
    };
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
    return {
      success: false,
      error: null,
      generalError: "Periode peminjaman tidak ditemukan.",
    };
  }

  if (timing === "final") {
    if (request.status !== "active" && request.status !== "overdue") {
      return {
        success: false,
        error: null,
        generalError: "Pengajuan ini tidak bisa dikembalikan.",
      };
    }
    const existingFinal = await prisma.addendum.findFirst({
      where: { periodId: latestPeriod.id, timing: "final" },
    });
    if (existingFinal) {
      return {
        success: false,
        error: null,
        generalError: "Addendum akhir untuk periode ini sudah pernah dikirim.",
      };
    }
  } else {
    const isExtension = latestPeriod.periodType === "extension";

    if (isExtension) {
      if (request.status !== "active") {
        return {
          success: false,
          error: null,
          generalError: "Pengajuan ini belum siap untuk addendum.",
        };
      }
      const signedContract = await prisma.document.findFirst({
        where: { periodId: latestPeriod.id, type: "signed_contract" },
      });
      if (!signedContract || signedContract.reviewStatus !== "approved") {
        return {
          success: false,
          error: null,
          generalError: "Kontrak yang kamu tanda tangani masih direview admin.",
        };
      }
    } else {
      if (request.status !== "ready_to_pickup") {
        return {
          success: false,
          error: null,
          generalError: "Pengajuan ini belum siap untuk addendum.",
        };
      }
    }

    const existingInitial = await prisma.addendum.findFirst({
      where: { periodId: latestPeriod.id, timing: "initial" },
    });
    if (existingInitial) {
      return {
        success: false,
        error: null,
        generalError: "Addendum awal untuk periode ini sudah pernah dikirim.",
      };
    }
  }

  const confirmedTruthful = formData.get("confirmedTruthful") === "on";
  if (!confirmedTruthful) {
    return {
      success: false,
      error: "Kamu harus mengonfirmasi bahwa data kondisi ini benar.",
      generalError: null,
    };
  }

  const parsed = addendumDataSchema.safeParse({
    completeness: formData.get("completeness"),
    bodyCondition: formData.get("bodyCondition"),
    accessoriesCondition: formData.get("accessoriesCondition") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      generalError: null,
    };
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
      return { success: false, error: validation.error, generalError: null };
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

  return { success: true, error: null, generalError: null };
}
