import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los eventos
export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "DIRECTORA_ACADEMICA" && session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({ ok: true, events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ ok: false, error: "Error al obtener eventos" }, { status: 500 });
  }
}

// POST - Crear un nuevo evento
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "DIRECTORA_ACADEMICA" && session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, eventDate, location } = body;

    if (!name || !eventDate) {
      return NextResponse.json({ ok: false, error: "Nombre y fecha del evento son requeridos" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        eventDate: new Date(eventDate),
        location,
      },
    });

    return NextResponse.json({ ok: true, event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ ok: false, error: "Error al crear evento" }, { status: 500 });
  }
}
