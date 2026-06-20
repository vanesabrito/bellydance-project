import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

function calculateAgeCategory(age: number | null): string {
  if (!age) return "BELLYDANCE_ADULTAS";
  if (age >= 4 && age <= 11) return "MINI_BELLYDANCE";
  if (age >= 12 && age <= 17) return "BELLYDANCE_ADOLESCENTES";
  return "BELLYDANCE_ADULTAS";
}

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // Si es profesora, permitir acceso pero filtrar por sus clases
  if (session.user?.role === "PROFESORA") {
    // Profesora puede ver sus propias alumnas
  } else if (session.user?.role !== "ADMIN" && session.user?.role !== "DIRECTORA_ACADEMICA")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("search");
    const ageCategory = searchParams.get("ageCategory");
    const academicLevel = searchParams.get("academicLevel");

    const where: any = {
      status: "APPROVED",
    };

    // Si es profesora, filtrar por sus clases
    if (session.user?.role === "PROFESORA") {
      where.class = {
        instructorId: session.user.id,
      };
    }

    if (searchTerm) {
      where.student = {
        OR: [
          { nombre: { contains: searchTerm, mode: "insensitive" } },
          { apellido: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      };
    }

    if (ageCategory) {
      where.ageCategory = ageCategory;
    }

    if (academicLevel) {
      where.academicLevel = academicLevel;
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            edad: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { student: { nombre: "asc" } },
      ],
    });

    // Group students by age category and academic level
    const groupedStudents = {
      MINI_BELLYDANCE: {
        BASICO: [],
        INTERMEDIO: [],
        AVANZADO: [],
      },
      BELLYDANCE_ADOLESCENTES: {
        BASICO: [],
        INTERMEDIO: [],
        AVANZADO: [],
      },
      BELLYDANCE_ADULTAS: {
        BASICO: [],
        INTERMEDIO: [],
        AVANZADO: [],
      },
    };

    enrollments.forEach((enrollment: any) => {
      // Calculate age category if not set
      const category = enrollment.ageCategory || calculateAgeCategory(enrollment.student.edad);
      // Default to BASICO if academic level is not set
      const level = enrollment.academicLevel || "BASICO";

      // Update the enrollment object with calculated values
      enrollment.ageCategory = category;
      enrollment.academicLevel = level;

      if (groupedStudents[category as keyof typeof groupedStudents]) {
        const categoryGroup = groupedStudents[category as keyof typeof groupedStudents];
        (categoryGroup as any)[level].push(enrollment);
      }
    });

    // Calculate counts
    const counts = {
      total: enrollments.length,
      byCategory: {
        MINI_BELLYDANCE: enrollments.filter((e: any) => e.ageCategory === "MINI_BELLYDANCE").length,
        BELLYDANCE_ADOLESCENTES: enrollments.filter((e: any) => e.ageCategory === "BELLYDANCE_ADOLESCENTES").length,
        BELLYDANCE_ADULTAS: enrollments.filter((e: any) => e.ageCategory === "BELLYDANCE_ADULTAS").length,
      },
      byLevel: {
        BASICO: enrollments.filter((e: any) => e.academicLevel === "BASICO").length,
        INTERMEDIO: enrollments.filter((e: any) => e.academicLevel === "INTERMEDIO").length,
        AVANZADO: enrollments.filter((e: any) => e.academicLevel === "AVANZADO").length,
      },
      byGroup: {
        MINI_BELLYDANCE_BASICO: groupedStudents.MINI_BELLYDANCE.BASICO.length,
        MINI_BELLYDANCE_INTERMEDIO: groupedStudents.MINI_BELLYDANCE.INTERMEDIO.length,
        MINI_BELLYDANCE_AVANZADO: groupedStudents.MINI_BELLYDANCE.AVANZADO.length,
        BELLYDANCE_ADOLESCENTES_BASICO: groupedStudents.BELLYDANCE_ADOLESCENTES.BASICO.length,
        BELLYDANCE_ADOLESCENTES_INTERMEDIO: groupedStudents.BELLYDANCE_ADOLESCENTES.INTERMEDIO.length,
        BELLYDANCE_ADOLESCENTES_AVANZADO: groupedStudents.BELLYDANCE_ADOLESCENTES.AVANZADO.length,
        BELLYDANCE_ADULTAS_BASICO: groupedStudents.BELLYDANCE_ADULTAS.BASICO.length,
        BELLYDANCE_ADULTAS_INTERMEDIO: groupedStudents.BELLYDANCE_ADULTAS.INTERMEDIO.length,
        BELLYDANCE_ADULTAS_AVANZADO: groupedStudents.BELLYDANCE_ADULTAS.AVANZADO.length,
      },
    };

    return NextResponse.json({
      ok: true,
      students: groupedStudents,
      counts,
      enrollments,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch enrolled students" },
      { status: 500 }
    );
  }
}
