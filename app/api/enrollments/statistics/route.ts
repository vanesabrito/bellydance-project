import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user?.role !== "ADMINISTRADOR" && session.user?.role !== "DIRECTORA_ACADEMICA")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const ageCategory = searchParams.get("ageCategory");
    const academicLevel = searchParams.get("academicLevel");

    const where: any = {
      status: "APPROVED",
    };

    if (ageCategory) {
      where.ageCategory = ageCategory;
    }

    if (academicLevel) {
      where.academicLevel = academicLevel;
    }

    // Get total count by age category and academic level
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            user: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                edad: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      total: enrollments.length,
      byAgeCategory: {
        MINI_BELLYDANCE: enrollments.filter(e => e.ageCategory === "MINI_BELLYDANCE").length,
        BELLYDANCE_ADOLESCENTES: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADOLESCENTES").length,
        BELLYDANCE_ADULTAS: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADULTAS").length,
      },
      byAcademicLevel: {
        BASICO: enrollments.filter(e => e.academicLevel === "BASICO").length,
        INTERMEDIO: enrollments.filter(e => e.academicLevel === "INTERMEDIO").length,
        AVANZADO: enrollments.filter(e => e.academicLevel === "AVANZADO").length,
      },
      byCategoryAndLevel: {
        MINI_BELLYDANCE: {
          BASICO: enrollments.filter(e => e.ageCategory === "MINI_BELLYDANCE" && e.academicLevel === "BASICO").length,
          INTERMEDIO: enrollments.filter(e => e.ageCategory === "MINI_BELLYDANCE" && e.academicLevel === "INTERMEDIO").length,
          AVANZADO: enrollments.filter(e => e.ageCategory === "MINI_BELLYDANCE" && e.academicLevel === "AVANZADO").length,
        },
        BELLYDANCE_ADOLESCENTES: {
          BASICO: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADOLESCENTES" && e.academicLevel === "BASICO").length,
          INTERMEDIO: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADOLESCENTES" && e.academicLevel === "INTERMEDIO").length,
          AVANZADO: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADOLESCENTES" && e.academicLevel === "AVANZADO").length,
        },
        BELLYDANCE_ADULTAS: {
          BASICO: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADULTAS" && e.academicLevel === "BASICO").length,
          INTERMEDIO: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADULTAS" && e.academicLevel === "INTERMEDIO").length,
          AVANZADO: enrollments.filter(e => e.ageCategory === "BELLYDANCE_ADULTAS" && e.academicLevel === "AVANZADO").length,
        },
      },
      enrollments,
    };

    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
