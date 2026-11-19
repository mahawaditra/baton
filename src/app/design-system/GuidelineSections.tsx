import { GroupHeading, Rule, Specimen, Subsection } from "./parts";

const VOICES = [
  {
    where: "Public pages and borrower emails",
    voice: "Casual Indonesian, kamu",
    example: "Kode aksesnya belum cocok. Cek lagi email konfirmasi kamu.",
  },
  {
    where: "Admin",
    voice: "Plain English",
    example: "Couldn't assign the instrument. Try again.",
  },
  {
    where: "Handbook",
    voice: "Zenka's own voice, on purpose",
    example: "SEHARUSNYA instrumennya udah disiapin di Sekre.",
  },
];

const GLOSSARY = [
  ["peminjam", "borrower"],
  ["tiket", "ticket"],
  ["kode akses", "access code"],
  ["addendum", "addendum"],
  ["deposit", "deposit"],
  ["jatuh tempo", "due date"],
  ["perpanjangan", "extension"],
  ["pengembalian", "return"],
];

export function GuidelineSections() {
  return (
    <>
      <GroupHeading id="guidelines">Guidelines</GroupHeading>

      <Subsection
        id="writing"
        title="Writing"
        description="Three voices, one set of terms. The contract PDF stays formal; everything else follows the voice of the page it lives on."
      >
        <Specimen className="p-0 sm:p-0">
          <ul className="w-full">
            {VOICES.map((row) => (
              <li
                key={row.where}
                className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="text-label text-foreground">
                  {row.where}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {row.voice}
                  </span>
                </span>
                <span className="text-body text-foreground-2">
                  {row.example}
                </span>
              </li>
            ))}
          </ul>
        </Specimen>
        <ul className="flex flex-col gap-2">
          <Rule>
            Use sentence case for buttons, headings, labels and statuses. Proper
            names keep their capitals: BATON, OSUI Mahawaditra, LINE, KTP,
            Ticket ID, Ketua.
          </Rule>
          <Rule>
            Say what happened and what to do next. Use belum when the borrower
            can fix it.
          </Rule>
          <Rule tone="dont">
            Use internal terms like Tahap 2, assign or Stage in public copy.
          </Rule>
          <Rule tone="dont">
            Blame the reader, or use emoji anywhere in the interface.
          </Rule>
        </ul>
        <Specimen label="Glossary" className="p-0 sm:p-0">
          <table className="w-full text-left text-body">
            <thead>
              <tr className="border-b border-border text-micro text-muted-foreground uppercase">
                <th className="px-4 py-2.5 font-semibold">Public</th>
                <th className="px-4 py-2.5 font-semibold">Admin</th>
              </tr>
            </thead>
            <tbody>
              {GLOSSARY.map(([publicTerm, adminTerm]) => (
                <tr
                  key={publicTerm}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-2 text-foreground">{publicTerm}</td>
                  <td className="px-4 py-2 text-foreground-2">{adminTerm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Specimen>
      </Subsection>

      <Subsection
        id="accessibility"
        title="Accessibility"
        description="The floor every screen has to clear before it ships."
      >
        <ul className="flex flex-col gap-2">
          <Rule>
            Keep text contrast at 4.5:1 for body copy and 3:1 for large headings
            and UI.
          </Rule>
          <Rule>
            Always show a visible focus ring. Never remove an outline without
            replacing it.
          </Rule>
          <Rule>Give every icon-only button an aria-label.</Rule>
          <Rule>
            Pair every status colour with a text label, and every music glyph
            with a word.
          </Rule>
          <Rule>
            Tie form errors to their field with aria-describedby and
            aria-invalid, and move focus to the first one.
          </Rule>
          <Rule>
            Respect reduced motion: anything that moves has an instant fallback.
          </Rule>
        </ul>
      </Subsection>
    </>
  );
}
