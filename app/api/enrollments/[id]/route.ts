import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "COORDINATOR"].includes(session.user?.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = params.id;
  const body = await req.json();
  const { status, reviewNote } = body as {
    status?: string;
    reviewNote?: string;
  };

  try {
    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: status as any,
        reviewNote: reviewNote ?? undefined,
        reviewedAt: new Date(),
        reviewerId: session.user.id,
      } as any,
      select: {
        id: true,
        status: true,
        reviewNote: true as any,
        reviewedAt: true,
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
