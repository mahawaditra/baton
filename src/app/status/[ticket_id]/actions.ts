"use server";

import { prisma } from "@/lib/prisma";
import {
  uploadFile,
  downloadFileAsBase64,
  getGeneratedContractFolder,
} from "@/lib/drive";
import {
  buildContractHTML,
  headerTemplate,
  footerTemplate,
} from "@/lib/contract-pdf";
import puppeteer from "puppeteer";

type RequestData = {
  ticketId: string;
  borrowerName: string;
  status: string;
  instrumentTypeRequested: string;
  instrumentConfirmed: boolean;
};

type VerifyResult =
  | { success: true; request: RequestData }
  | { success: false; error: string };

type DownloadResult =
  | { success: true; dataUrl: string; fileName: string }
  | { success: false; error: string };

export async function verifyAccessCode(
  ticketId: string,
  code: string,
): Promise<VerifyResult> {
  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
    select: {
      ticketId: true,
      accessCode: true,
      borrowerName: true,
      status: true,
      instrumentTypeRequested: true,
      instrumentConfirmed: true,
    },
  });

  if (!request || request.accessCode !== code) {
    return { success: false, error: "Invalid access code." };
  }

  const { accessCode, ...safeData } = request;
  return { success: true, request: safeData };
}

type Stage2State = {
  success: boolean;
  error: string | null;
};

export async function submitStage2(
  ticketId: string,
  prevState: Stage2State,
  formData: FormData,
): Promise<Stage2State> {
  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { ticketId },
  });

  if (request.status !== "reviewing" || !request.instrumentConfirmed) {
    return { success: false, error: "This request is not ready for Stage 2." };
  }

  if (!request.instrumentId) {
    return { success: false, error: "No instrument assigned yet." };
  }

  const ktpNumber = formData.get("ktpNumber") as string;
  const addressKtp = formData.get("addressKtp") as string;
  const addressDomicile = formData.get("addressDomicile") as string;
  const faculty = formData.get("faculty") as string;
  const guardianName = formData.get("guardianName") as string;
  const guardianPhone = formData.get("guardianPhone") as string;
  const guardianAddressKtp = formData.get("guardianAddressKtp") as string;

  const [instrument, settings] = await Promise.all([
    prisma.instrument.findUniqueOrThrow({
      where: { id: request.instrumentId },
    }),
    prisma.loanSetting.findFirstOrThrow(),
  ]);

  const signatoryImageBase64 = settings.signatoryImageDriveId
    ? await downloadFileAsBase64(settings.signatoryImageDriveId, "image/png")
    : null;

  const html = buildContractHTML({
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
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    bankHolder: settings.bankHolder,
    dueDate: settings.dueDate,
  });

  const browser = await puppeteer.launch();
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

  return {
    success: true,
    dataUrl,
    fileName: `Kontrak ${request.borrowerName}_${ticketId}.pdf`,
  };
}
