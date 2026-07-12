import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los pagos con sus recibos
export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
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
        receipt: true,
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ ok: true, payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ ok: false, error: "Error al obtener pagos" }, { status: 500 });
  }
}

// PUT - Actualizar un pago existente
export async function PUT(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { id, studentId, paymentDate, amount, paymentType, referenceNumber, bank } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID del pago es requerido" }, { status: 400 });
    }

    if (!studentId || !amount || !paymentType) {
      return NextResponse.json({ ok: false, error: "Alumna, monto y tipo de pago son requeridos" }, { status: 400 });
    }

    // Actualizar el pago
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        studentId,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        amount: parseFloat(amount),
        paymentType,
        referenceNumber,
        bank,
      },
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
        receipt: true,
      },
    });

    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ ok: false, error: "Error al actualizar pago" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (session.user?.role !== "ADMINISTRADOR") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, paymentDate, amount, paymentType, referenceNumber, bank } = body;

    if (!studentId || !amount || !paymentType) {
      return NextResponse.json({ ok: false, error: "Alumna, monto y tipo de pago son requeridos" }, { status: 400 });
    }

    // Generar número de recibo único
    const lastReceipt = await prisma.paymentReceipt.findFirst({
      orderBy: { receiptNumber: "desc" },
    });

    let receiptNumber = "REC-000001";
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.receiptNumber.replace("REC-", ""));
      receiptNumber = `REC-${String(lastNumber + 1).padStart(6, "0")}`;
    }

    // Crear el pago
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

    // Generar automáticamente el recibo
    const receipt = await prisma.paymentReceipt.create({
      data: {
        receiptNumber,
        paymentId: payment.id,
        issueDate: new Date(),
        status: "PAGADO",
      },
    });

    return NextResponse.json({ ok: true, payment, receipt });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ ok: false, error: "Error al registrar pago" }, { status: 500 });
  }
}