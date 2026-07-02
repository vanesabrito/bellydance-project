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

    let whereClause: any = {};
    
    if (session.user?.role === "PROFESORA") {
      whereClause.instructorId = session.user.id;
    } else if (session.user?.role === "ALUMNA") {
      // Obtener coreografías donde la alumna es participante
      const participations = await prisma.choreographyParticipant.findMany({
        where: {
          studentId: session.user.id
        },
        select: {
          choreographyId: true
        }
      });
      
      const choreographyIds = participations.map(p => p.choreographyId);
      whereClause.id = { in: choreographyIds };
    } else if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const choreographies = await prisma.choreography.findMany({
      where: whereClause,
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

    console.log("Choreographies fetched:", choreographies.length);
    choreographies.forEach((ch: any) => {
      console.log(`Choreography: ${ch.name}, Participants: ${ch.participants.length}`);
      console.log("Participants:", ch.participants);
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

    console.log("POST Choreography - videoUrl:", videoUrl);
    console.log("POST Choreography - participantIds:", participantIds);

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

    console.log("Choreography created with videoUrl:", choreography.videoUrl);
    console.log("Choreography created with participants:", choreography.participants);

    return NextResponse.json({ ok: true, choreography });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
