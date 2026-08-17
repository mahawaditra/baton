import { RequestForm } from "./RequestForm";

export default function RequestPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <RequestForm />
      </main>
      <footer className="px-6 py-8 text-center text-caption text-muted-foreground">
        Punya pertanyaan? Hubungi Ketua Logistik OSUI Mahawaditra.
      </footer>
    </div>
  );
}
