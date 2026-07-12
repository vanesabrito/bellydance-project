import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user?.role !== "ADMINISTRADOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { enrollmentId, academicLevel } = body as {
      enrollmentId: string;
      academicLevel: string;
    };

    if (!enrollmentId || !academicLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validLevels = ["BASICO", "INTERMEDIO", "AVANZADO"];
    if (!validLevels.includes(academicLevel)) {
      return NextResponse.json({ error: "Invalid academic level" }, { status: 400 });
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        academicLevel: academicLevel as any,
      },
      include: {
        student: {
          select: {
            user: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/admin/enrollments");
    revalidatePath("/admin/academic-classification");

    return NextResponse.json({ ok: true, enrollment: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Update failed" },
      { status: 400 }
    );
  }
}
