import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, level, music, videoUrl, duration, status, participantIds } = body;

    console.log("PUT Choreography - videoUrl:", videoUrl);
    console.log("PUT Choreography - participantIds:", participantIds);

    const choreography = await prisma.choreography.findUnique({
      where: { id: params.id },
    });

    if (!choreography) {
      return NextResponse.json({ ok: false, error: "Coreografía no encontrada" }, { status: 404 });
    }

    if (session.user?.role === "PROFESORA") {
      const profesora = await prisma.profesora.findUnique({
        where: { userId: session.user.id }
      });
      if (profesora && choreography.instructorId !== profesora.id) {
        return NextResponse.json({ ok: false, error: "No tienes permiso para editar esta coreografía" }, { status: 403 });
      }
    }

    // Eliminar participantes existentes
    await prisma.choreographyParticipant.deleteMany({
      where: { choreographyId: params.id },
    });

    console.log("Deleted existing participants");

    // Actualizar coreografía y crear nuevos participantes
    const updatedChoreography = await prisma.choreography.update({
      where: { id: params.id },
      data: {
        name,
        description,
        level,
        music,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        status,
        participants: participantIds && participantIds.length > 0
          ? {
              create: participantIds.map((studentId: string) => ({
                studentId,
              })),
            }
          : undefined,
      },
      include: {
        participants: {
          include: {
            student: {
              select: {
                user: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("Choreography updated with participants:", updatedChoreography.participants);

    return NextResponse.json({ ok: true, choreography: updatedChoreography });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const choreography = await prisma.choreography.findUnique({
      where: { id: params.id },
    });

    if (!choreography) {
      return NextResponse.json({ ok: false, error: "Coreografía no encontrada" }, { status: 404 });
    }

    if (session.user?.role === "PROFESORA") {
      const profesora = await prisma.profesora.findUnique({
        where: { userId: session.user.id }
      });
      if (profesora && choreography.instructorId !== profesora.id) {
        return NextResponse.json({ ok: false, error: "No tienes permiso para eliminar esta coreografía" }, { status: 403 });
      }
    }

    await prisma.choreography.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
