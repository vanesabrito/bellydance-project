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

    const { nombre, apellido, email, telefono } = await req.json();

    // Validaciones
    if (!nombre || !apellido || !email) {
      return NextResponse.json(
        { error: "Nombre, apellido y correo son obligatorios." },
        { status: 400 }
      );
    }

    if (nombre.trim() === "" || apellido.trim() === "" || email.trim() === "") {
      return NextResponse.json(
        { error: "Los campos no pueden estar vacíos." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Obtener el usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { email: (session as any).user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso por otro usuario." },
          { status: 400 }
        );
      }
    }

    // Actualizar los datos del usuario
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        direccion: telefono || null,
      },
    });

    return NextResponse.json(
      { 
        message: "Los datos de tu perfil han sido actualizados exitosamente.",
        user: {
          nombre: updatedUser.nombre,
          apellido: updatedUser.apellido,
          email: updatedUser.email,
          direccion: updatedUser.direccion,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "No fue posible actualizar los datos. Inténtelo nuevamente." },
      { status: 500 }
    );
  }
}
