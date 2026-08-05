export type RequestData = {
  ticketId: string;
  borrowerName: string;
  status: string;
  instrumentTypeRequested: string;
  instrumentConfirmed: boolean;
  hasInitialAddendum: boolean;
  dueDate: Date | null;
};
