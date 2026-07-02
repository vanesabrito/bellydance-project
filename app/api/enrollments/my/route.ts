import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      enrollmentDate: true,
      reviewNote: true as any,
      reviewedAt: true as any,
      class: { select: { name: true } },
    },
  });
  const normalized = enrollments.map((enrollment) => ({
    ...enrollment,
    className: enrollment.class?.name ?? "",
  }));
  return NextResponse.json({ ok: true, enrollments: normalized });
}
