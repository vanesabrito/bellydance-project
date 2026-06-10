import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

function calculateAgeCategory(age: number | null): string {
  if (!age) return "BELLYDANCE_ADULTAS";
  if (age >= 4 && age <= 11) return "MINI_BELLYDANCE";
  if (age >= 12 && age <= 17) return "BELLYDANCE_ADOLESCENTES";
  return "BELLYDANCE_ADULTAS";
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = params.id;
  const body = await req.json();
  const { status, reviewNote, academicLevel } = body as {
    status?: string;
    reviewNote?: string;
    academicLevel?: string;
  };

  try {
    // Get the enrollment with student data
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            edad: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Calculate age category automatically when approving
    let ageCategory = enrollment.ageCategory;
    if (status === "APPROVED" && !ageCategory) {
      ageCategory = calculateAgeCategory(enrollment.student.edad);
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: status as any,
        reviewNote: reviewNote ?? undefined,
        academicLevel: academicLevel ? academicLevel as any : enrollment.academicLevel,
        ageCategory: ageCategory as any,
        reviewedAt: new Date(),
        reviewerId: session.user.id,
      } as any,
      select: {
        id: true,
        status: true,
        reviewNote: true as any,
        reviewedAt: true,
        academicLevel: true,
        ageCategory: true,
        reviewer: { select: { id: true, email: true } },
      } as any,
    });

    revalidatePath("/admin/enrollments");
    revalidatePath("/admin/reports");
    revalidatePath("/student/enrollments");

    return NextResponse.json({ ok: true, ...updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Update failed" },
      { status: 400 }
    );
  }
}
