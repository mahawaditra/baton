import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EditGoodForm } from "./EditGoodForm";
import {
  ConditionIndicator,
  getConditionLabel,
} from "@/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function GoodDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === "true";

  const good = await prisma.good.findUniqueOrThrow({
    where: { id },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{good.name}</h1>
        {good.brand && (
          <p className="mt-1 text-sm text-muted-foreground">{good.brand}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Condition</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-medium">
                    <ConditionIndicator condition={good.condition} />
                    {getConditionLabel(good.condition)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="mt-0.5 font-medium">{good.quantity}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reg. No.</dt>
                  <dd className="tabular mt-0.5 font-medium">
                    {good.registrationNo || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 font-medium">{good.location}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Notes</dt>
                  <dd className="mt-0.5 font-medium">{good.notes || "—"}</dd>
                </div>
              </dl>

              <Link
                href={`/admin/goods/${id}?edit=true`}
                className={cn(buttonVariants({ size: "sm" }), "self-start")}
              >
                Edit Good
              </Link>
            </div>
          ) : (
            <EditGoodForm good={good} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
