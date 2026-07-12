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

  const [
    totalUsers,
    totalAdmins,
    totalAlumnas,
    totalEnrollments,
    pending,
    approved,
    rejected,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { nombre: "ADMINISTRADOR" } } }),
    prisma.user.count({ where: { role: { nombre: "ALUMNA" } } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count({ where: { status: "APPROVED" } }),
    prisma.enrollment.count({ where: { status: "REJECTED" } }),
  ]);

  const recent = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      createdAt: true,
      student: { select: { user: { select: { email: true } } } },
      class: { select: { name: true } },
    },
  });

  const recentWithClassName = recent.map((enrollment) => ({
    ...enrollment,
    className: enrollment.class?.name ?? "",
    studentEmail: enrollment.student?.user?.email ?? "",
  }));

  return NextResponse.json({
    stats: {
      totalUsers,
      totalAdmins,
      totalAlumnas,
      totalEnrollments,
      pending,
      approved,
      rejected,
    },
    recent: recentWithClassName,
  });
}
