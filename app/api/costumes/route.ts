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
      // Obtener vestuarios de las profesoras asignadas a través de inscripciones aprobadas
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: session.user.id,
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
    } else if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const costumes = await prisma.costume.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            nombre: true,
            apellido: true,
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

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, color, imageUrl, accessories, estimatedCost, choreographyId } = body;

    console.log("POST Costume - imageUrl:", imageUrl);

    if (!name) {
      return NextResponse.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
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
        instructorId: session.user.id,
      },
    });

    console.log("Costume created with imageUrl:", costume.imageUrl);

    return NextResponse.json({ ok: true, costume });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
