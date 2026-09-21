import Link from "next/link";
import {
  formatActivityLog,
  formatJakartaDateTime,
  formatJakartaTime,
  getEntityUrl,
  resolveActorName,
} from "@/lib/format";
import type { ActivityLog, Admin } from "@/generated/prisma/client";

export type ActivityLogWithAdmin = ActivityLog & { admin: Admin | null };

export function ActivityTimeline({
  logs,
  linkEntities = true,
  tags,
  showDate = true,
}: {
  logs: ActivityLogWithAdmin[];
  linkEntities?: boolean;
  tags?: Map<string, string>;
  showDate?: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-3.5">
      <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-muted" />
      {logs.map((log) => {
        const url = linkEntities
          ? getEntityUrl(log.entityType, log.entityId)
          : null;
        const tag = tags?.get(log.entityId);
        const content = (
          <>
            <span className="font-semibold">
              {resolveActorName(log.admin, log.adminName)}
            </span>{" "}
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
              <div className="mt-0.5 flex items-center gap-2 text-caption text-muted-foreground">
                <span className="tabular">
                  {showDate
                    ? formatJakartaDateTime(log.createdAt)
                    : formatJakartaTime(log.createdAt)}
                </span>
                {tag && (
                  <span className="tabular rounded-sm bg-muted px-1.5 py-0.5 font-medium">
                    {tag}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
