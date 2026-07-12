import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los horarios de clases
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("instructorId");

    // Si es profesora, solo puede ver sus propios horarios
    if (session.user?.role === "PROFESORA") {
      if (instructorId && instructorId !== session.user.id) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
      }
    } else if (session.user?.role !== "ADMINISTRADOR" && session.user?.role !== "DIRECTORA_ACADEMICA") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const whereClause: any = {};
    if (instructorId) {
      whereClause.instructorId = instructorId;
    } else if (session.user?.role === "PROFESORA") {
      whereClause.instructorId = session.user.id;
    }

    const schedules = await prisma.classSchedule.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            user: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, schedules });
  } catch (error) {
    console.error("Error fetching class schedules:", error);
    return NextResponse.json({ ok: false, error: "Error al obtener horarios" }, { status: 500 });
  }
}

// POST - Crear nuevo horario de clase
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { category, academicLevel, month, day, time, classroom, instructorId } = body;

    // Validaciones
    if (!category || !academicLevel || !month || !day || !time || !classroom || !instructorId) {
      return NextResponse.json({ ok: false, error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // Validar que la profesora exista y esté activa
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      include: { role: true },
    });

    if (!instructor) {
      return NextResponse.json({ ok: false, error: "La profesora no existe" }, { status: 404 });
    }

    if (instructor.role.nombre !== "PROFESORA") {
      return NextResponse.json({ ok: false, error: "El usuario seleccionado no es una profesora" }, { status: 400 });
    }

    // Verificar duplicados para la misma profesora, categoría, nivel académico, día y hora
    const existingSchedule = await prisma.classSchedule.findFirst({
      where: {
        instructorId,
        category,
        academicLevel,
        day,
        time,
      },
    });

    if (existingSchedule) {
      return NextResponse.json({ ok: false, error: "Ya existe un horario registrado para esta profesora, categoría, nivel académico, día y hora" }, { status: 409 });
    }

    // Crear horario
    const schedule = await prisma.classSchedule.create({
      data: {
        category,
        academicLevel,
        month,
        day,
        time,
        classroom,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            user: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, schedule });
  } catch (error) {
    console.error("Error creating class schedule:", error);
    return NextResponse.json({ ok: false, error: "Error al crear horario" }, { status: 500 });
  }
}

// PUT - Actualizar horario existente
export async function PUT(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { id, category, academicLevel, month, day, time, classroom, instructorId } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID del horario es requerido" }, { status: 400 });
    }

    // Validaciones
    if (!category || !academicLevel || !month || !day || !time || !classroom || !instructorId) {
      return NextResponse.json({ ok: false, error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // Validar que la profesora exista y esté activa
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      include: { role: true },
    });

    if (!instructor) {
      return NextResponse.json({ ok: false, error: "La profesora no existe" }, { status: 404 });
    }

    if (instructor.role.nombre !== "PROFESORA") {
      return NextResponse.json({ ok: false, error: "El usuario seleccionado no es una profesora" }, { status: 400 });
    }

    // Verificar duplicados para la misma profesora, categoría, nivel académico, día y hora (excluyendo el registro actual)
    const existingSchedule = await prisma.classSchedule.findFirst({
      where: {
        instructorId,
        category,
        academicLevel,
        day,
        time,
        id: { not: id },
      },
    });

    if (existingSchedule) {
      return NextResponse.json({ ok: false, error: "Ya existe un horario registrado para esta profesora, categoría, nivel académico, día y hora" }, { status: 409 });
    }

    // Actualizar horario
    const schedule = await prisma.classSchedule.update({
      where: { id },
      data: {
        category,
        academicLevel,
        month,
        day,
        time,
        classroom,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            user: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, schedule });
  } catch (error) {
    console.error("Error updating class schedule:", error);
    return NextResponse.json({ ok: false, error: "Error al actualizar horario" }, { status: 500 });
  }
}

// DELETE - Eliminar horario
export async function DELETE(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID del horario es requerido" }, { status: 400 });
    }

    await prisma.classSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting class schedule:", error);
    return NextResponse.json({ ok: false, error: "Error al eliminar horario" }, { status: 500 });
  }
}
