import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - Obtener evaluaciones
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "DIRECTORA_ACADEMICA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (classId) {
      if (session.user?.role === "PROFESORA") {
        // Profesoras solo pueden ver evaluaciones de sus clases
        const classRecord = await prisma.class.findUnique({
          where: { id: classId },
          select: { instructorId: true },
        });
        if (classRecord?.instructorId !== session.user.id) {
          return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }
      }
      where.classId = classId;
    }
    if (studentId) where.studentId = studentId;

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
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
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ ok: true, evaluations });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json({ ok: false, error: "Error al obtener evaluaciones" }, { status: 500 });
  }
}

// POST - Crear evaluación
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "DIRECTORA_ACADEMICA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, classId, date, score, comments, progress } = body;

    if (!studentId || !classId || !date) {
      return NextResponse.json({ ok: false, error: "Estudiante, clase y fecha son requeridos" }, { status: 400 });
    }

    // Verificar que la profesora tiene permiso para crear evaluaciones en esta clase
    if (session.user?.role === "PROFESORA") {
      const classRecord = await prisma.class.findUnique({
        where: { id: classId },
        select: { instructorId: true },
      });
      if (classRecord?.instructorId !== session.user.id) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
      }
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        classId,
        date: new Date(date),
        score: score ? parseFloat(score) : null,
        comments,
        progress,
      },
    });

    return NextResponse.json({ ok: true, evaluation });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json({ ok: false, error: "Error al crear evaluación" }, { status: 500 });
  }
}
