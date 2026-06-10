import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email es requerido" }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "Formato de email inválido" }, { status: 400 });
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({ 
        ok: true, 
        message: "Si el email existe en nuestro sistema, se enviará un enlace de recuperación" 
      });
    }

    // Generar token de recuperación
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora de expiración

    // Actualizar usuario con el token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        resetToken,
        resetTokenExpires,
      },
    });

    // Generar enlace de recuperación
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Aquí se debería enviar el email con el enlace de recuperación
    // Por ahora, simulamos el envío mostrando el enlace en la respuesta
    // En producción, esto debería ser reemplazado por un servicio de email real
    console.log(`Enlace de recuperación para ${email}: ${resetLink}`);

    return NextResponse.json({ 
      ok: true, 
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico",
      // Solo para desarrollo - en producción eliminar este campo
      resetLink: resetLink 
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
