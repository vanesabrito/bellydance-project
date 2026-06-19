import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { studentId, documentType, description, observations, status } = await req.json();

    // Validaciones
    if (!studentId || !documentType) {
      return NextResponse.json(
        { error: "Alumna y tipo de documento son obligatorios." },
        { status: 400 }
      );
    }

    if (documentType === "OTRO" && !description) {
      return NextResponse.json(
        { error: "La descripción es obligatoria cuando se selecciona 'Otro documento'." },
        { status: 400 }
      );
    }

    // Verificar que la alumna existe
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Alumna no encontrada." },
        { status: 404 }
      );
    }

    // Crear el documento
    const document = await prisma.document.create({
      data: {
        studentId,
        type: documentType,
        description: description || null,
        observations: observations || null,
        status: status || "RECIBIDO",
        registeredById: (session as any).user.id,
      },
    });

    return NextResponse.json(
      { 
        message: "Documento recibido exitosamente.",
        document
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al recibir documento:", error);
    return NextResponse.json(
      { error: "No fue posible recibir el documento. Inténtelo nuevamente." },
      { status: 500 }
    );
  }
}
