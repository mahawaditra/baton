import { prisma } from "@/lib/prisma";
import { updateGood } from "./actions";

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
  const updateWithId = updateGood.bind(null, id);

  return (
    <div>
      <h1>{good.name}</h1>

      {!isEditing ? (
        <>
          <p>Quantity: {good.quantity}</p>
          <p>Condition: {good.condition}</p>
          <p>Location: {good.location}</p>
          <p>Registration No.: {good.registrationNo}</p>
          <p>Notes: {good.notes}</p>

          <a href={`/admin/goods/${id}?edit=true`}>
            <button>Edit Good</button>
          </a>
        </>
      ) : (
        <form action={updateWithId}>
          <input
            name="name"
            defaultValue={good.name}
            placeholder="Name"
            required
          />
          <input
            name="quantity"
            type="number"
            defaultValue={good.quantity}
            placeholder="Quantity"
          />

          <select name="condition" defaultValue={good.condition}>
            <option value="ok">OK</option>
            <option value="need_repair">Need Repair</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
          </select>

          <input
            name="location"
            defaultValue={good.location}
            placeholder="Location"
          />
          <input
            name="registrationNo"
            defaultValue={good.registrationNo ?? ""}
            placeholder="Registration No."
          />
          <textarea
            name="notes"
            defaultValue={good.notes ?? ""}
            placeholder="Notes"
          />

          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}
