import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusLabel } from "@/utils/status";

function csvEscape(value: string | null | undefined): string {
  const v = (value ?? "").replace(/"/g, '""');
  return `"${v}"`;
}

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
      createdAt: true,
      reviewedAt: true as any,
      reviewNote: true as any,
      student: { select: { email: true } },
      reviewer: { select: { email: true } } as any,
      class: { select: { name: true } },
    },
  });

  const header = [
    "id",
    "clase",
    "alumno",
    "estado",
    "creado",
    "revisado",
    "revisor",
    "nota",
  ].join(",");

  const rows = enrollments.map((d: any) =>
    [
      d.id,
      d.class?.name ?? "",
      d.student?.email ?? "",
      statusLabel(d.status),
      d.createdAt?.toISOString?.() ?? new Date(d.createdAt).toISOString(),
      d.reviewedAt ? new Date(d.reviewedAt).toISOString() : "",
      d.reviewer?.email ?? "",
      d.reviewNote ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=reporte_inscripciones.csv",
      "Cache-Control": "no-store",
    },
  });
}
