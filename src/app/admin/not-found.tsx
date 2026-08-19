import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <EmptyState
        icon={SearchX}
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        tone="search"
        action={
          <Link href="/admin/dashboard" className={cn(buttonVariants())}>
            Back to Dashboard
          </Link>
        }
      />
    </div>
  );
}
