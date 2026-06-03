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

    const costumes = await prisma.costume.findMany({
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

    return NextResponse.json({ ok: true, costume });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
