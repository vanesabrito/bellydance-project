import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ ok: false, error: "Todos los campos son requeridos" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Obtener el usuario actual
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar que la contraseña antigua sea correcta
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    // Verificar que la nueva contraseña sea diferente a la antigua
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return NextResponse.json({ ok: false, error: "La nueva contraseña debe ser diferente a la antigua" }, { status: 400 });
    }

    // Hashear la nueva contraseña
    const hash = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    // Aquí se debería enviar el email con la nueva contraseña
    // Por ahora, simulamos el envío mostrando la contraseña en la respuesta
    // En producción, esto debería ser reemplazado por un servicio de email real
    console.log(`Nueva contraseña para ${user.email}: ${newPassword}`);

    return NextResponse.json({ 
      ok: true, 
      message: "Contraseña cambiada exitosamente",
      // Solo para desarrollo - en producción eliminar este campo
      newPassword: newPassword 
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
