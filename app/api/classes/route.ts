import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true },
  });
  return NextResponse.json({ ok: true, classes });
}
