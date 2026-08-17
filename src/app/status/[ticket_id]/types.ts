import type { BorrowingRequestStatus } from "@/generated/prisma/client";

export type RequestData = {
  ticketId: string;
  borrowerName: string;
  status: BorrowingRequestStatus;
  createdAt: Date;
  rejectionReason: string | null;
  cancellationReason: string | null;
  instrumentTypeRequested: string;
  instrumentConfirmed: boolean;
  hasInitialAddendum: boolean;
  uploadedDocumentTypes: string[];
  dueDate: Date | null;
  canExtend: boolean;
  isExtensionPeriod: boolean;
  needsExtensionDocuments: boolean;
  canFillExtensionAddendum: boolean;
  hasFinalAddendum: boolean;
  borrowerKtpNumber: string | null;
  borrowerAddressKtp: string | null;
  borrowerAddressDomicile: string | null;
  borrowerFaculty: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianAddressKtp: string | null;
};
