import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "PROFESORA" && session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const classRecord = await prisma.class.findUnique({
      where: { id: params.id },
    });

    if (!classRecord) {
      return NextResponse.json({ ok: false, error: "Clase no encontrada" }, { status: 404 });
    }

    if (session.user?.role === "PROFESORA") {
      const profesora = await prisma.profesora.findUnique({
        where: { userId: session.user.id }
      });
      if (profesora && classRecord.instructorId !== profesora.id) {
        return NextResponse.json({ ok: false, error: "No tienes permiso para eliminar esta clase" }, { status: 403 });
      }
    }

    await prisma.class.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true, message: "Clase eliminada correctamente" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
