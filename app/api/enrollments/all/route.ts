import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "COORDINATOR"].includes(session.user?.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      reviewNote: true as any,
      reviewedAt: true as any,
      createdAt: true,
      student: { select: { email: true, id: true } },
      class: { select: { name: true } },
    },
  });

  const normalized = enrollments.map((enrollment) => ({
    ...enrollment,
    className: enrollment.class?.name ?? "",
  }));

  return NextResponse.json({ ok: true, enrollments: normalized });
}
