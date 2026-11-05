import Link from "next/link";
import { LineIcon, WhatsAppIcon } from "@/components/ContactLink";
import { getPublicContacts } from "@/lib/public-contacts";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/request", label: "Ajukan peminjaman" },
  { href: "/status", label: "Cek status" },
] as const;

export async function PublicFooter({
  containerClassName = "max-w-4xl",
}: {
  containerClassName?: string;
}) {
  const { whatsappNumber, lineAddFriendUrl } = await getPublicContacts();

  return (
    <footer className="bg-hero-bg px-6 pt-10 pb-6 text-hero-fg dark:border-t dark:border-border">
      <div className={cn("mx-auto", containerClassName)}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-h3 font-bold">BATON</p>
            <p className="mt-1 text-caption text-hero-fg/70">
              Logistik OSUI Mahawaditra
            </p>
          </div>
          <nav
            aria-label="Tautan footer"
            className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-caption sm:gap-x-14"
          >
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-hero-fg/90 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {(whatsappNumber || lineAddFriendUrl) && (
              <ul className="flex flex-col gap-2.5">
                {whatsappNumber && (
                  <li>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-hero-fg/90 transition-colors hover:text-gold"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                      WhatsApp
                    </a>
                  </li>
                )}
                {lineAddFriendUrl && (
                  <li>
                    <a
                      href={lineAddFriendUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-hero-fg/90 transition-colors hover:text-gold"
                    >
                      <LineIcon className="h-3.5 w-3.5 shrink-0" />
                      LINE
                    </a>
                  </li>
                )}
              </ul>
            )}
          </nav>
        </div>
        <div className="mt-8 border-t border-hero-fg/15 pt-4">
          <p className="text-caption text-hero-fg/60">
            <span className="uppercase">Est. 2026</span> by haseulbintaro
          </p>
          <span className="mt-1 block text-micro leading-[18px] text-hero-fg/5">
            #STANLOONA
          </span>
        </div>
      </div>
    </footer>
  );
}
