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

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, color, imageUrl, accessories, estimatedCost, choreographyId, status } = body;

    const costume = await prisma.costume.findUnique({
      where: { id: params.id },
    });

    if (!costume) {
      return NextResponse.json({ ok: false, error: "Vestuario no encontrado" }, { status: 404 });
    }

    if (session.user?.role === "PROFESORA" && costume.instructorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "No tienes permiso para editar este vestuario" }, { status: 403 });
    }

    const updatedCostume = await prisma.costume.update({
      where: { id: params.id },
      data: {
        name,
        description,
        color,
        imageUrl,
        accessories,
        estimatedCost,
        choreographyId,
        status,
      },
    });

    return NextResponse.json({ ok: true, costume: updatedCostume });
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

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const costume = await prisma.costume.findUnique({
      where: { id: params.id },
    });

    if (!costume) {
      return NextResponse.json({ ok: false, error: "Vestuario no encontrado" }, { status: 404 });
    }

    if (session.user?.role === "PROFESORA" && costume.instructorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "No tienes permiso para eliminar este vestuario" }, { status: 403 });
    }

    await prisma.costume.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
