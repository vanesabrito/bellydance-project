import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, createdAt: true },
  } as any);

  return NextResponse.json({ ok: true, users });
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { nombre, apellido, cedula, email, fechaNacimiento, edad, direccion, password, role } = body;
    
    if (!email || !password || !role)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    
    if (cedula) {
      const existingCedula = await prisma.user.findFirst({ where: { cedula } });
      if (existingCedula)
        return NextResponse.json(
          { error: "Cedula already in use" },
          { status: 409 }
        );
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hash, 
        role,
        nombre: nombre || null,
        apellido: apellido || null,
        cedula: cedula || null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        edad: edad ? parseInt(edad) : null,
        direccion: direccion || null
      },
    });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
