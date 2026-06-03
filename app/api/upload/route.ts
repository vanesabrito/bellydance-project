import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Validar que sea una imagen, video o audio
    const validTypes = [
      "image/",
      "video/",
      "audio/",
    ];
    
    const isValidType = validTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      return NextResponse.json({ ok: false, error: "El archivo debe ser una imagen, video o audio" }, { status: 400 });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${originalName}`;
    
    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar el archivo en el directorio uploads
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Retornar la URL del archivo
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ ok: true, fileUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}
