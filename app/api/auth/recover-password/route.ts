import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
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
        message: "Si el email existe en nuestro sistema, se enviará una contraseña provisional" 
      });
    }

    // Generar contraseña provisional
    const temporaryPassword = generateTemporaryPassword();
    const hash = await bcrypt.hash(temporaryPassword, 10);

    // Actualizar contraseña del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    // Aquí se debería enviar el email con la contraseña provisional
    // Por ahora, simulamos el envío mostrando la contraseña en la respuesta
    // En producción, esto debería ser reemplazado por un servicio de email real
    console.log(`Contraseña provisional para ${email}: ${temporaryPassword}`);

    return NextResponse.json({ 
      ok: true, 
      message: "Se ha enviado una contraseña provisional a tu correo electrónico",
      // Solo para desarrollo - en producción eliminar este campo
      temporaryPassword: temporaryPassword 
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
