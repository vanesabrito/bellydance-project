import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const choreographies = await prisma.choreography.findMany({
      where: session.user?.role === "PROFESORA" 
        ? { instructorId: session.user.id }
        : {},
      include: {
        instructor: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        participants: {
          include: {
            student: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, choreographies });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, level, music, videoUrl, duration, status, participantIds } = body;

    if (!name) {
      return NextResponse.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
    }

    const choreography = await prisma.choreography.create({
      data: {
        name,
        description,
        level,
        music,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        status,
        instructorId: session.user.id,
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
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, choreography });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
