import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los pagos
export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN" && session.user?.role !== "DIRECTORA_ACADEMICA") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
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
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ ok: true, payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ ok: false, error: "Error al obtener pagos" }, { status: 500 });
  }
}

// POST - Registrar un nuevo pago
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN" && session.user?.role !== "DIRECTORA_ACADEMICA") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, paymentDate, amount, paymentType, referenceNumber, bank } = body;

    if (!studentId || !amount || !paymentType) {
      return NextResponse.json({ ok: false, error: "Estudiante, monto y tipo de pago son requeridos" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        studentId,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        amount: parseFloat(amount),
        paymentType,
        referenceNumber,
        bank,
      },
    });

    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ ok: false, error: "Error al registrar pago" }, { status: 500 });
  }
}
