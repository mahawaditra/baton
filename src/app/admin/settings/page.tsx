import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { addAdmin, updateLoanSettings } from "./actions";
import { CompressedImageInput } from "./CompressedImageInput";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "super_admin";

  const admins = isSuperAdmin
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  const loanSettings = await prisma.loanSetting.findFirst();

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>Loan Settings</h2>
        <form action={updateLoanSettings}>
          <label>
            Due Date
            <input
              name="dueDate"
              type="date"
              defaultValue={loanSettings?.dueDate?.toISOString().split("T")[0]}
              required
            />
          </label>
          <label>
            Deposit Amount (full)
            <input
              name="depositAmount"
              type="number"
              defaultValue={loanSettings?.depositAmount ?? 100000}
              required
            />
          </label>
          <label>
            Deposit Amount (partial)
            <input
              name="depositPartialAmount"
              type="number"
              defaultValue={loanSettings?.depositPartialAmount ?? 50000}
              required
            />
          </label>
          <label>
            Deposit Grace Days
            <input
              name="depositGraceDays"
              type="number"
              defaultValue={loanSettings?.depositGraceDays ?? 14}
              required
            />
          </label>
          <label>
            Bank Name
            <input
              name="bankName"
              type="text"
              defaultValue={loanSettings?.bankName ?? ""}
              required
            />
          </label>
          <label>
            Bank Account Number
            <input
              name="bankAccount"
              type="text"
              defaultValue={loanSettings?.bankAccount ?? ""}
              required
            />
          </label>
          <label>
            Bank Account Holder
            <input
              name="bankHolder"
              type="text"
              defaultValue={loanSettings?.bankHolder ?? ""}
              required
            />
          </label>
          <h3>Signatory Data (PIHAK PERTAMA)</h3>
          <label>
            Name
            <input
              name="signatoryName"
              type="text"
              defaultValue={loanSettings?.signatoryName ?? ""}
              required
            />
          </label>
          <label>
            Phone
            <input
              name="signatoryPhone"
              type="text"
              defaultValue={loanSettings?.signatoryPhone ?? ""}
              required
            />
          </label>
          <label>
            LINE ID
            <input
              name="signatoryLineId"
              type="text"
              defaultValue={loanSettings?.signatoryLineId ?? ""}
              required
            />
          </label>
          <label>
            Address (as per KTP)
            <input
              name="signatoryAddressKtp"
              type="text"
              defaultValue={loanSettings?.signatoryAddressKtp ?? ""}
              required
            />
          </label>
          <label>
            Current Address
            <input
              name="signatoryAddressDomicile"
              type="text"
              defaultValue={loanSettings?.signatoryAddressDomicile ?? ""}
              required
            />
          </label>
          <label>
            Faculty/Major
            <input
              name="signatoryFaculty"
              type="text"
              defaultValue={loanSettings?.signatoryFaculty ?? ""}
              required
            />
          </label>
          <label>
            Year
            <input
              name="signatoryYear"
              type="text"
              defaultValue={loanSettings?.signatoryYear ?? ""}
              required
            />
          </label>
          <label>
            Section/Instrument
            <input
              name="signatorySection"
              type="text"
              defaultValue={loanSettings?.signatorySection ?? ""}
              required
            />
          </label>
          <label>
            KTP Number
            <input
              name="signatoryKtpNumber"
              type="text"
              defaultValue={loanSettings?.signatoryKtpNumber ?? ""}
              required
            />
          </label>
          <label>
            Signature Image{" "}
            {loanSettings?.signatoryImageDriveId &&
              "(already uploaded — leave empty to keep current)"}
            <CompressedImageInput name="signatoryImage" format="image/png" />
          </label>
          <button type="submit">Save Loan Settings</button>
        </form>
      </section>

      {isSuperAdmin && (
        <section>
          <h2>Admin Management</h2>

          <form action={addAdmin}>
            <input
              name="email"
              type="email"
              placeholder="New admin email"
              required
            />
            <input
              name="name"
              type="text"
              placeholder="New admin name"
              required
            />
            <button type="submit">Add Admin</button>
          </form>

          <h3>Admin List</h3>
          <ul>
            {admins.map((admin) => (
              <li key={admin.id}>
                {admin.name} ({admin.email}) — {admin.role}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
