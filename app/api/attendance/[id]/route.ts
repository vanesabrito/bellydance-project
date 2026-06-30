import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Actualizar asistencia
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que la asistencia existe
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: { class: true },
    });

    if (!existingAttendance) {
      return NextResponse.json({ ok: false, error: "Asistencia no encontrada" }, { status: 404 });
    }

    // Verificar que la profesora tiene permiso para editar asistencia en esta clase
    if (session.user?.role === "PROFESORA") {
      if (existingAttendance.class.instructorId !== session.user.id) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: params.id },
      data: {
        ...(studentId !== undefined && { studentId }),
        ...(classId !== undefined && { classId }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(present !== undefined && { present }),
        ...(note !== undefined && { note }),
        ...(observations !== undefined && { observations }),
      },
    });

    return NextResponse.json({ ok: true, attendance: updatedAttendance });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json({ ok: false, error: "Error al actualizar asistencia" }, { status: 500 });
  }
}

// DELETE - Eliminar asistencia
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "DIRECTORA_ACADEMICA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    // Verificar que la asistencia existe
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: { class: true },
    });

    if (!existingAttendance) {
      return NextResponse.json({ ok: false, error: "Asistencia no encontrada" }, { status: 404 });
    }

    // Verificar que la profesora tiene permiso para eliminar asistencia en esta clase
    if (session.user?.role === "PROFESORA") {
      if (existingAttendance.class.instructorId !== session.user.id) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
      }
    }

    await prisma.attendance.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({ ok: false, error: "Error al eliminar asistencia" }, { status: 500 });
  }
}
