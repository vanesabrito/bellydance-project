import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, apellido, cedula, email, fechaNacimiento, edad, direccion, password } = body;
    if (!email || !password || !nombre || !apellido || !cedula || !fechaNacimiento || !edad || !direccion)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    
    const existingCedula = await prisma.user.findFirst({ where: { cedula } });
    if (existingCedula)
      return NextResponse.json(
        { error: "Cedula already in use" },
        { status: 409 }
      );
    
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hash, 
        role: "ALUMNA",
        nombre,
        apellido,
        cedula,
        fechaNacimiento: new Date(fechaNacimiento),
        edad: parseInt(edad),
        direccion
      },
    });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
