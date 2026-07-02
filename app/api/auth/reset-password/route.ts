import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ ok: false, error: "Todos los campos son requeridos" }, { status: 400 });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return NextResponse.json({ ok: false, error: "Las contraseñas no coinciden" }, { status: 400 });
    }

    // Validar fortaleza de la contraseña
    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    // Validar que tenga al menos una mayúscula, una minúscula y un número
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json({ 
        ok: false, 
        error: "La contraseña debe contener al menos una mayúscula, una minúscula y un número" 
      }, { status: 400 });
    }

    // Buscar usuario con el token de recuperación
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: "El enlace de recuperación es inválido o ha expirado" 
      }, { status: 400 });
    }

    // Hashear la nueva contraseña
    const hash = await bcrypt.hash(password, 10);

    // Actualizar contraseña del usuario y limpiar el token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Contraseña actualizada exitosamente" 
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
