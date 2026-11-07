import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <EmptyState
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        action={
          <Link href="/" className={cn(buttonVariants())}>
            Back to Dashboard
          </Link>
        }
      />
    </div>
  );
}
