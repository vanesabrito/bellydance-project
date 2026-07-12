import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user?.role !== "ADMINISTRADOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const enrollments = await prisma.enrollment.findMany({
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    status: true,
    reviewNote: true as any,
    reviewedAt: true as any,
    createdAt: true,
    student: { 
      select: { 
        user: { 
          select: { email: true, id: true } 
        } 
      } 
    },
    class: { select: { name: true } },
  },
});

const normalized = enrollments.map((enrollment) => ({
  ...enrollment,
  className: enrollment.class?.name ?? "",
  studentEmail: enrollment.student?.user?.email ?? "",
  studentId: enrollment.student?.user?.id ?? "",
}));

return NextResponse.json({ ok: true, enrollments: normalized });
}
