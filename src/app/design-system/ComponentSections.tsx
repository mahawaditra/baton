import { Hash, MapPin } from "lucide-react";
import { ActionConsequence } from "@/components/ActionConsequence";
import { Disclosure } from "@/components/Disclosure";
import { EmptyState } from "@/components/EmptyState";
import { EntityCard } from "@/components/EntityCard";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { GlyphBadge } from "@/components/GlyphBadge";
import { LoanStepper } from "@/components/LoanStepper";
import { Notice, NoticeRow } from "@/components/Notice";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { SegmentBar } from "@/components/SegmentBar";
import { StatusBadge } from "@/components/StatusBadge";
import { TicketCard, TicketLabel } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { LOAN_STEP_LABELS } from "@/lib/loan/loan-rules";
import {
  AlertDialogDemo,
  CollapseDemo,
  FieldDemo,
  HoldButtonDemo,
  SegmentedDemo,
  ToastDemo,
} from "./demos";
import { GroupHeading, Specimen, Subsection } from "./parts";

const LADDER = [
  {
    level: "p",
    effect: "Can be undone",
    pattern: "Runs straight away, then a toast",
  },
  {
    level: "mf",
    effect: "Emails the borrower",
    pattern: "No dialog, one line under the button saying what gets sent",
  },
  {
    level: "f",
    effect: "Can't be undone",
    pattern: "Alert dialog that names the consequence, with a specific verb",
  },
  {
    level: "sfz",
    effect: "Removes access",
    pattern: "Alert dialog plus a hold-to-confirm button",
  },
];

export function ComponentSections() {
  return (
    <>
      <GroupHeading id="components">Components</GroupHeading>

      <Subsection
        id="notice"
        title="Notice"
        description="One component for every notice box. Gold means it's your turn to act, plum means the staff are on it, and a plain card is just information. The compact version carries short form errors and Handbook warnings."
      >
        <div data-reveal-grid className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Notice tone="borrower" title="Giliran kamu">
            Lengkapi data kontrak, lalu upload 3 dokumen.
          </Notice>
          <Notice tone="staff" title="Giliran staf">
            Staf lagi ngecek dokumen kamu.
          </Notice>
          <Notice tone="success" title="Udah dikembalikan">
            Makasih udah balikin instrumennya!
          </Notice>
          <Notice tone="danger" title="Pengajuan ditolak">
            Instrumen sedang dipakai latihan gabungan.
          </Notice>
          <Notice tone="info" title="Loan in progress" meta="Due 30/06/2027">
            The borrower holds the instrument until it is returned.
          </Notice>
          <Notice tone="neutral" title="Pengajuan dibatalkan">
            Peminjam tidak jadi meminjam.
          </Notice>
        </div>
        <Notice tone="danger" compact>
          Kode aksesnya belum cocok. Cek lagi email konfirmasi kamu.
        </Notice>
      </Subsection>

      <Subsection
        id="field"
        title="Field"
        description="Label on top, hint or error underneath, wired to the input with aria-describedby and aria-invalid. Mark what's optional instead of starring what's required. Forms skip browser validation so every message is BATON's own."
      >
        <Specimen>
          <FieldDemo />
        </Specimen>
      </Subsection>

      <Subsection
        id="badges"
        title="Badges"
        description="Status badges always carry a text label, never colour alone. Glyph badges are the only badges with notation: soft on neutral surfaces, outline on a ticket hero."
      >
        <Specimen label="Request status">
          <RequestStatusBadge status="submitted" />
          <RequestStatusBadge status="documents_uploaded" />
          <RequestStatusBadge status="active" />
          <RequestStatusBadge status="returned" />
          <RequestStatusBadge status="overdue" />
          <RequestStatusBadge status="rejected" />
        </Specimen>
        <Specimen label="Instrument status, with a condition indicator when it needs attention">
          <StatusBadge status="available" condition="ok" />
          <StatusBadge status="placed" condition="ok" />
          <StatusBadge status="borrowed" condition="need_repair" />
          <StatusBadge status="unavailable" condition="retired" />
        </Specimen>
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Specimen label="Glyph badges, soft">
            <ExtensionBadge count={2} />
            <GlyphBadge glyph="fermata">Ongoing</GlyphBadge>
          </Specimen>
          <Specimen
            label="Glyph badges, outline on a hero"
            className="bg-hero-bg"
          >
            <ExtensionBadge count={1} variant="outline" />
            <GlyphBadge glyph="fermata" variant="outline">
              Ongoing
            </GlyphBadge>
            <span className="tabular text-xs text-hero-fg/70">
              Since 12/11/2026
            </span>
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="ticket"
        title="Ticket"
        description="The ticket shape is reserved for things that stand for a loan ticket, so anything with a Ticket ID. Notches, the curved outline and perforations all come from one token, --ticket-notch. The two halves never share a tone."
      >
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Specimen
            label="Hero top, borrower's turn underneath"
            className="block"
          >
            <TicketCard
              topTone="hero"
              bottomTone="gold"
              top={
                <div className="px-6 pt-5 pb-6">
                  <TicketLabel>Ticket ID</TicketLabel>
                  <span className="tabular mt-1 block font-heading text-display tracking-[0.02em]">
                    26999901
                  </span>
                </div>
              }
              bottom={
                <NoticeRow
                  tone="borrower"
                  title="Giliran kamu"
                  className="px-6 pt-4 pb-5"
                >
                  Download kontrak, tanda tangan, lalu upload lagi.
                </NoticeRow>
              }
            />
          </Specimen>
          <Specimen label="Card top, staff's turn underneath" className="block">
            <TicketCard
              bottomTone="plum"
              top={
                <div className="px-6 py-5">
                  <LoanStepper steps={LOAN_STEP_LABELS} current={2} />
                </div>
              }
              bottom={
                <NoticeRow
                  tone="staff"
                  title="Giliran staf"
                  className="px-6 pt-4 pb-5"
                >
                  Staf lagi ngecek dokumen kamu.
                </NoticeRow>
              }
            />
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="progress"
        title="Progress"
        description="One vocabulary: done is primary with a check, current is gold with a ring, upcoming is an outline. Rejected, cancelled and overdue are not steps, they replace the stepper with a Notice. A bar's colour has to mean something; if it only shows position, it's primary."
      >
        <Specimen className="block">
          <LoanStepper steps={LOAN_STEP_LABELS} current={3} />
        </Specimen>
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Specimen label="Position: survey page 1 of 2" className="block">
            <SegmentBar filled={1} total={2} />
          </Specimen>
          <Specimen
            label="Meaning: 2 of 3 borrower slots used"
            className="block"
          >
            <SegmentBar filled={2} total={3} tone="plum" />
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="disclosure"
        title="Disclosure & collapse"
        description="Disclosure is a native details element for page content; its chevron flips from down to up. Collapse is a button with a grid-row panel for structural groups; its chevron turns from right to down, and a closed panel is inert so the keyboard skips it."
      >
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Specimen label="Disclosure" className="block">
            <Disclosure
              className="rounded-xl border border-border bg-background px-5 py-4"
              summaryClassName="rounded-sm text-body font-medium text-foreground"
              summary="Email berisi Ticket ID dan kode akses tidak masuk?"
            >
              <p className="mt-3 text-body text-foreground-2">
                Cek folder Spam di email kamu dan tandai sebagai &quot;Bukan
                spam&quot;.
              </p>
            </Disclosure>
          </Specimen>
          <Specimen label="Collapse">
            <CollapseDemo />
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="confirmation"
        title="Confirmation"
        description="How hard an action asks for confirmation depends on what it does, named after dynamics. The level names live only here, never in the UI."
      >
        <Specimen className="p-0 sm:p-0">
          <table className="w-full text-left text-body">
            <thead>
              <tr className="border-b border-border text-micro text-muted-foreground uppercase">
                <th className="px-4 py-2.5 font-semibold">Level</th>
                <th className="px-4 py-2.5 font-semibold">Effect</th>
                <th className="px-4 py-2.5 font-semibold">Pattern</th>
              </tr>
            </thead>
            <tbody>
              {LADDER.map((row) => (
                <tr
                  key={row.level}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-2.5 font-heading font-bold text-foreground italic">
                    {row.level}
                  </td>
                  <td className="px-4 py-2.5 text-foreground-2">
                    {row.effect}
                  </td>
                  <td className="px-4 py-2.5 text-foreground-2">
                    {row.pattern}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Specimen>
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Specimen label="mf: consequence line" className="flex-col">
            <Button>Notify borrower</Button>
            <ActionConsequence>
              Emails the borrower to fill in contract details.
            </ActionConsequence>
          </Specimen>
          <Specimen label="f: alert dialog">
            <AlertDialogDemo />
          </Specimen>
          <Specimen label="sfz: hold to confirm">
            <HoldButtonDemo />
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="empty-state"
        title="Empty state"
        description="A quarter rest for anything that's empty. Gold when a search or filter found nothing, plain when there's simply nothing yet."
      >
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Specimen className="block">
            <EmptyState
              title="No instruments yet"
              description="Instruments added by admin will appear here."
            />
          </Specimen>
          <Specimen className="block">
            <EmptyState
              tone="search"
              title="No matching instruments"
              description="Try a different search term."
            />
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="toast"
        title="Toast"
        description="One sentence. Admin errors start with Couldn't, public errors end with the next step. Error toasts stay until they're closed."
      >
        <Specimen>
          <ToastDemo />
        </Specimen>
      </Subsection>

      <Subsection
        id="segmented"
        title="Segmented control"
        description="Two or three options with a sliding indicator. The indicator's corner is the outer corner minus the padding."
      >
        <Specimen>
          <SegmentedDemo />
        </Specimen>
      </Subsection>

      <Subsection
        id="cards"
        title="Cards"
        description="Below the table breakpoint, and whenever a table wouldn't fit, lists turn into cards grouped by what makes sense for the data. Tables never scroll sideways."
      >
        <Specimen className="block max-w-md">
          <EntityCard
            href="#cards"
            title="Trumpet"
            subtitle="Yamaha"
            topRight={<StatusBadge status="available" condition="ok" />}
            metaLeft={[{ icon: Hash, text: "02/1/B/II/19" }]}
            metaGrow={{ icon: MapPin, text: "Sekre" }}
          />
        </Specimen>
      </Subsection>
    </>
  );
}
