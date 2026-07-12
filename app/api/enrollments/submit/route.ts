import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user?.id as string;
    const body = await req.json();
    const { classId } = body;
    if (!classId)
      return NextResponse.json({ error: "Missing classId" }, { status: 400 });

    const danceClass = await prisma.class.findUnique({ where: { id: classId } });
    if (!danceClass)
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });

    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId: userId,
        classId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (existing)
      return NextResponse.json(
        { error: "Ya existe una inscripción activa para esta clase" },
        { status: 409 }
      );

    // Buscar el registro Alumna correspondiente al userId
const alumna = await prisma.alumna.findUnique({
  where: { userId }
});

if (!alumna) {
  return NextResponse.json({ error: "Usuario no es una alumna" }, { status: 400 });
}

const enrollment = await prisma.enrollment.create({
  data: {
    studentId: alumna.id,
    classId,
  },
});

    revalidatePath("/admin/enrollments");
    revalidatePath("/admin/reports");
    revalidatePath("/student/enrollments");

    return NextResponse.json({ ok: true, enrollment: { id: enrollment.id } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
