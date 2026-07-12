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
      const profesora = await prisma.profesora.findUnique({
        where: { userId: session.user.id }
      });
      if (profesora) {
        whereClause.instructorId = profesora.id;
      }
    } else if (session.user?.role === "ALUMNA") {
      // Obtener vestuarios de las profesoras asignadas a través de inscripciones aprobadas
      const alumna = await prisma.alumna.findUnique({
        where: { userId: session.user.id }
      });
      
      if (alumna) {
        const enrollments = await prisma.enrollment.findMany({
          where: {
            studentId: alumna.id,
            status: "APPROVED"
          },
          include: {
            class: {
              select: {
                instructorId: true
              }
            }
          }
        });
        
        const instructorIds = enrollments.map(e => e.class.instructorId);
        whereClause.instructorId = { in: instructorIds };
      }
    } else if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const costumes = await prisma.costume.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            user: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        choreography: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, costumes });
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
    const { name, description, color, imageUrl, accessories, estimatedCost, choreographyId } = body;

    console.log("POST Costume - imageUrl:", imageUrl);

    if (!name) {
      return NextResponse.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
    }

    const profesora = await prisma.profesora.findUnique({
      where: { userId: session.user.id }
    });

    if (!profesora) {
      return NextResponse.json({ ok: false, error: "Usuario no es una profesora" }, { status: 400 });
    }

    const costume = await prisma.costume.create({
      data: {
        name,
        description,
        color,
        imageUrl,
        accessories,
        estimatedCost,
        choreographyId,
        instructorId: profesora.id,
      },
    });

    console.log("Costume created with imageUrl:", costume.imageUrl);

    return NextResponse.json({ ok: true, costume });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}