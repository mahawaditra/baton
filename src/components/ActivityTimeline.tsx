import Link from "next/link";
import { formatActivityLog, getEntityUrl } from "@/lib/format";
import type { ActivityLog, Admin } from "@/generated/prisma/client";

export function ActivityTimeline({
  logs,
  linkEntities = true,
}: {
  logs: (ActivityLog & { admin: Admin })[];
  linkEntities?: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-3.5">
      <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-muted" />
      {logs.map((log) => {
        const url = linkEntities
          ? getEntityUrl(log.entityType, log.entityId)
          : null;
        const content = (
          <>
            <span className="font-semibold">{log.admin.name}</span>{" "}
            {formatActivityLog(log)}
          </>
        );
        return (
          <div key={log.id} className="flex gap-3.5">
            <span className="relative z-10 mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-surface bg-navy" />
            <div>
              <div className="text-sm">
                {url ? (
                  <Link href={url} className="hover:underline">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
              <div className="tabular mt-0.5 text-[11px] text-muted-foreground">
                {log.createdAt.toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
