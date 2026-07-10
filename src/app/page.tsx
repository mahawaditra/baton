import { prisma } from "@/lib/prisma";

export default async function Home() {
  const count = await prisma.testPing.count();
  return <div>Jumlah TestPing: {count}</div>;
}
