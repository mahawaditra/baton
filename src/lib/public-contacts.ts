import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { toWhatsAppNumber } from "@/lib/format";

export type PublicContacts = {
  whatsappNumber?: string;
  lineAddFriendUrl?: string;
};

export const getPublicContacts = cache(async (): Promise<PublicContacts> => {
  const settings = await prisma.loanSetting.findFirst({
    select: {
      signatoryPhone: true,
      signatoryPhonePublic: true,
      signatoryLineAddFriendUrl: true,
      signatoryLineAddFriendPublic: true,
    },
  });
  return {
    whatsappNumber:
      settings?.signatoryPhonePublic && settings.signatoryPhone
        ? toWhatsAppNumber(settings.signatoryPhone)
        : undefined,
    lineAddFriendUrl:
      settings?.signatoryLineAddFriendPublic &&
      settings.signatoryLineAddFriendUrl
        ? settings.signatoryLineAddFriendUrl
        : undefined,
  };
});
