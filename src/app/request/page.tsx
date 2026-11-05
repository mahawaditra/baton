import { RequestForm } from "./RequestForm";

export default function RequestPage() {
  return (
    <main className="mx-auto w-full max-w-[51rem] flex-1 px-6 py-12 md:py-16">
      <RequestForm />
      <p className="mt-10 text-center text-caption text-muted-foreground">
        Punya pertanyaan? Hubungi Ketua Logistik OSUI Mahawaditra.
      </p>
    </main>
  );
}
