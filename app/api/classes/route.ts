import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
      // Obtener clases donde la alumna está inscrita y aprobada
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: session.user.id,
          status: "APPROVED"
        },
        select: {
          classId: true
        }
      });
      
      const classIds = enrollments.map(e => e.classId);
      whereClause.id = { in: classIds };
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        schedules: true,
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ ok: true, classes });
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
    const { 
      name, 
      description, 
      warmupExercises, 
      danceRoutineDescription, 
      danceTechniqueDescription 
    } = body;

    if (!name || !description || !warmupExercises || !danceRoutineDescription || !danceTechniqueDescription) {
      return NextResponse.json({ ok: false, error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        warmupExercises,
        danceRoutineDescription,
        danceTechniqueDescription,
        instructorId: session.user.id,
      },
    });

    return NextResponse.json({ ok: true, class: newClass });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      classId, 
      name, 
      description, 
      warmupExercises, 
      danceRoutineDescription, 
      danceTechniqueDescription,
      supportMaterial, 
      technique, 
      topic, 
      observations 
    } = body;

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      return NextResponse.json({ ok: false, error: "Clase no encontrada" }, { status: 404 });
    }

    if (session.user?.role === "PROFESORA" && classRecord.instructorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "No tienes permiso para editar esta clase" }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (warmupExercises !== undefined) {
      updateData.warmupExercises = warmupExercises;
    }
    if (danceRoutineDescription !== undefined) {
      updateData.danceRoutineDescription = danceRoutineDescription;
    }
    if (danceTechniqueDescription !== undefined) {
      updateData.danceTechniqueDescription = danceTechniqueDescription;
    }
    if (supportMaterial !== undefined) {
      updateData.supportMaterial = supportMaterial ? JSON.stringify(supportMaterial) : null;
    }
    if (technique !== undefined) {
      updateData.technique = technique;
    }
    if (topic !== undefined) {
      updateData.topic = topic;
    }
    if (observations !== undefined) {
      updateData.observations = observations;
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: updateData,
    });

    return NextResponse.json({ ok: true, class: updatedClass });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
