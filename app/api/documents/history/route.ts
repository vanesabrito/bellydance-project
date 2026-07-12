import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const documentType = searchParams.get("documentType");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Construir filtros
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (documentType) {
      where.type = documentType;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.receivedDate = {};
      if (dateFrom) {
        where.receivedDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.receivedDate.lte = new Date(dateTo);
      }
    }

    // Obtener documentos con información de la alumna y del usuario que registró
    const documents = await prisma.document.findMany({
      where,
      include: {
        student: {
          select: {
            user: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        registeredBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        receivedDate: "desc",
      },
    });

    // Formatear la respuesta
    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      studentName: `${doc.student.user.nombre} ${doc.student.user.apellido}`,
      type: doc.type,
      description: doc.description,
      receivedDate: doc.receivedDate,
      deliveryDate: doc.deliveryDate,
      status: doc.status,
      observations: doc.observations,
      registeredBy: `${doc.registeredBy.nombre} ${doc.registeredBy.apellido}`,
      fileUrl: doc.fileUrl,
      paymentId: doc.paymentId,
    }));

    return NextResponse.json(
      { 
        documents: formattedDocuments,
        total: formattedDocuments.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener historial de documentos:", error);
    return NextResponse.json(
      { error: "No fue posible obtener el historial de documentos. Inténtelo nuevamente." },
      { status: 500 }
    );
  }
}
