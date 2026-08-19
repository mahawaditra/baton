import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <EmptyState
        icon={SearchX}
        title="Halaman Tidak Ditemukan"
        description="Alamat yang kamu tuju tidak ada atau sudah dipindahkan. Coba periksa lagi link-nya, atau kembali ke beranda."
        tone="search"
        action={
          <Link href="/" className={cn(buttonVariants())}>
            Ke Beranda
          </Link>
        }
      />
    </div>
  );
}
