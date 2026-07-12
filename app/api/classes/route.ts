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
      // Buscar el registro Profesora correspondiente al userId
      const profesora = await prisma.profesora.findUnique({
        where: { userId: session.user.id }
      });
      if (profesora) {
        whereClause.instructorId = profesora.id;
      }
    } else if (session.user?.role === "ALUMNA") {
      // Obtener clases donde la alumna está inscrita y aprobada
      const alumna = await prisma.alumna.findUnique({
        where: { userId: session.user.id }
      });
      
      if (alumna) {
        const enrollments = await prisma.enrollment.findMany({
          where: {
            studentId: alumna.id,
            status: "APPROVED"
          },
          select: {
            classId: true
          }
        });
        
        const classIds = enrollments.map(e => e.classId);
        whereClause.id = { in: classIds };
      }
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        instructor: {
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
        schedules: true,
        enrollments: {
          include: {
            student: {
              select: {
                user: {
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

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMINISTRADOR") {
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

    // Buscar el registro Profesora correspondiente al userId
    const profesora = await prisma.profesora.findUnique({
      where: { userId: session.user.id }
    });

    if (!profesora) {
      return NextResponse.json({ ok: false, error: "Usuario no es una profesora" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        warmupExercises,
        danceRoutineDescription,
        danceTechniqueDescription,
        instructorId: profesora.id,
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

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMINISTRADOR") {
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

    if (session.user?.role === "PROFESORA") {
      const profesora = await prisma.profesora.findUnique({
        where: { userId: session.user.id }
      });
      if (profesora && classRecord.instructorId !== profesora.id) {
        return NextResponse.json({ ok: false, error: "No tienes permiso para editar esta clase" }, { status: 403 });
      }
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