import { BackHomeLink } from "@/components/BackHomeLink";
import { PublicFooter } from "@/components/PublicFooter";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-hero-bg px-6 py-6 text-hero-fg">
        <div className="mx-auto w-full max-w-3xl">
          <BackHomeLink />
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <PublicFooter containerClassName="max-w-3xl" />
    </div>
  );
}
