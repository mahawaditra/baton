import { LEGACY_CREW } from "@/lib/legacy-crew";
import { cn } from "@/lib/utils";
import { CrewPhoto } from "./CrewPhoto";

export function CrewSection() {
  const featured = LEGACY_CREW.find((member) => member.featured);
  const others = LEGACY_CREW.filter((member) => !member.featured);
  const halo = "[text-shadow:0_0_12px_var(--background),0_0_3px_var(--background)]";

  return (
    <section className="flex w-full max-w-[100rem] flex-col gap-10 self-center 2xl:flex-row 2xl:items-end 2xl:justify-center 2xl:gap-12">
      {featured && (
        <div className="flex shrink-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
          <CrewPhoto
            slug={featured.slug}
            name={featured.name}
            hasPhoto={Boolean(featured.photoDriveFileId)}
            featured
            className="h-44 w-44 sm:h-48 sm:w-48 2xl:h-60 2xl:w-60"
          />
          <div className={cn("flex flex-col gap-1", halo)}>
            <div className="font-heading text-h2 text-foreground">
              {featured.name}
            </div>
            {featured.lines.map((line) => (
              <div key={line} className="text-body-lg text-foreground">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-4 lg:grid-cols-4 2xl:w-auto 2xl:flex-none 2xl:grid-cols-[repeat(4,max-content)] 2xl:gap-x-10">
        {others.map((member) => (
          <div
            key={member.slug}
            className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-end sm:gap-4 sm:text-left"
          >
            <CrewPhoto
              slug={member.slug}
              name={member.name}
              hasPhoto={Boolean(member.photoDriveFileId)}
              className="h-24 w-24 2xl:h-28 2xl:w-28"
            />
            <div className={cn("flex min-w-0 max-w-36 flex-col gap-0.5", halo)}>
              <div className="font-heading text-title text-foreground">
                {member.name}
              </div>
              {member.lines.map((line) => (
                <div key={line} className="text-caption text-foreground">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
