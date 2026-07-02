import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los registros de asistencia
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
    const date = searchParams.get("date");

    const where: any = {};
    if (classId) {
      if (session.user?.role === "PROFESORA") {
        // Profesoras solo pueden ver asistencia de sus clases
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
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendances = await prisma.attendance.findMany({
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

    return NextResponse.json({ ok: true, attendances });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json({ ok: false, error: "Error al obtener asistencias" }, { status: 500 });
  }
}

// POST - Registrar asistencia
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
    const { studentId, classId, date, present, note, observations } = body;

    if (!studentId || !classId || !date) {
      return NextResponse.json({ ok: false, error: "Estudiante, clase y fecha son requeridos" }, { status: 400 });
    }

    // Verificar que la profesora tiene permiso para registrar asistencia en esta clase
    if (session.user?.role === "PROFESORA") {
      const classRecord = await prisma.class.findUnique({
        where: { id: classId },
        select: { instructorId: true },
      });
      if (classRecord?.instructorId !== session.user.id) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        date: new Date(date),
        present: present ?? false,
        note,
        observations,
      },
    });

    return NextResponse.json({ ok: true, attendance });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json({ ok: false, error: "Error al registrar asistencia" }, { status: 500 });
  }
}
