import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
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

    console.log("File received:", file.name, file.type, file.size);

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
    
    console.log("Generated filename:", fileName);
    
    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("File buffer size:", buffer.length);

    // Crear directorio public/uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    console.log("Upload directory:", uploadDir);

    try {
      await mkdir(uploadDir, { recursive: true });
      console.log("Directory created or already exists");
    } catch (mkdirError: any) {
      console.error("Error creating directory:", mkdirError);
      return NextResponse.json({ ok: false, error: "Error al crear directorio de uploads: " + mkdirError.message }, { status: 500 });
    }

    const filePath = path.join(uploadDir, fileName);
    console.log("File path:", filePath);
    
    await writeFile(filePath, buffer);
    console.log("File saved successfully");

    // Retornar la URL del archivo
    const fileUrl = `/uploads/${fileName}`;
    console.log("File URL:", fileUrl);

    return NextResponse.json({ ok: true, fileUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    console.error("Error stack:", err.stack);
    return NextResponse.json({ ok: false, error: "Error del servidor: " + (err?.message || "Error desconocido") }, { status: 500 });
  }
}
