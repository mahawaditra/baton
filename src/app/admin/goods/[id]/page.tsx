import { prisma } from "@/lib/prisma";
import { EditGoodForm } from "./EditGoodForm";
import Link from "next/link";

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
    <div>
      <h1>{good.name}</h1>

      {!isEditing ? (
        <>
          <p>Brand: {good.brand}</p>
          <p>Quantity: {good.quantity}</p>
          <p>Condition: {good.condition}</p>
          <p>Location: {good.location}</p>
          <p>Registration No.: {good.registrationNo}</p>
          <p>Notes: {good.notes}</p>

          <Link href={`/admin/goods/${id}?edit=true`}>
            <button>Edit Good</button>
          </Link>
        </>
      ) : (
        <EditGoodForm good={good} />
      )}
    </div>
  );
}
