import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get("role");
  
  // Si se filtra por rol ALUMNA, permitir acceso a DIRECTORA_ACADEMICA y PROFESORA
  if (roleFilter === "ALUMNA") {
    if (session.user?.role !== "ADMIN" && session.user?.role !== "DIRECTORA_ACADEMICA" && session.user?.role !== "PROFESORA")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (roleFilter === "PROFESORA") {
    if (session.user?.role !== "ADMIN" && session.user?.role !== "DIRECTORA_ACADEMICA")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    if (session.user?.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const whereClause = roleFilter ? { role: roleFilter } : {};
  const selectFields = roleFilter === "ALUMNA" || roleFilter === "PROFESORA"
    ? { id: true, email: true, role: true, nombre: true, apellido: true, createdAt: true }
    : { id: true, email: true, role: true, createdAt: true };

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: selectFields,
  } as any);

  return NextResponse.json({ ok: true, users });
}

// PUT - Actualizar un usuario existente
export async function PUT(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, nombre, apellido, cedula, email, fechaNacimiento, edad, direccion, password, role } = body;
    
    if (!id)
      return NextResponse.json({ error: "ID del usuario es requerido" }, { status: 400 });
    
    if (!email || !role)
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    
    // Verificar si el email ya está en uso por otro usuario
    const existingEmail = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (existingEmail)
      return NextResponse.json({ error: "Email ya está en uso" }, { status: 409 });
    
    if (cedula) {
      const existingCedula = await prisma.user.findFirst({ where: { cedula, NOT: { id } } });
      if (existingCedula)
        return NextResponse.json({ error: "Cédula ya está en uso" }, { status: 409 });
    }
    
    const updateData: any = {
      email,
      role,
      nombre: nombre || null,
      apellido: apellido || null,
      cedula: cedula || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      edad: edad ? parseInt(edad) : null,
      direccion: direccion || null
    };
    
    // Solo actualizar la contraseña si se proporciona una nueva
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
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
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    
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

// DELETE - Eliminar un usuario
export async function DELETE(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    
    if (!userId)
      return NextResponse.json({ error: "ID del usuario es requerido" }, { status: 400 });

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Verificar dependencias antes de eliminar
    const dependencies: string[] = [];

    // Verificar inscripciones como estudiante
    const enrollments = await prisma.enrollment.count({
      where: { studentId: userId },
    });
    if (enrollments > 0) {
      dependencies.push(`${enrollments} inscripción(es) como estudiante`);
    }

    // Verificar inscripciones revisadas
    const reviewedEnrollments = await prisma.enrollment.count({
      where: { reviewerId: userId },
    });
    if (reviewedEnrollments > 0) {
      dependencies.push(`${reviewedEnrollments} inscripción(es) revisada(s)`);
    }

    // Verificar clases como instructor
    const taughtClasses = await prisma.class.count({
      where: { instructorId: userId },
    });
    if (taughtClasses > 0) {
      dependencies.push(`${taughtClasses} clase(s) asignada(s) como instructor`);
    }

    // Verificar registros de asistencia
    const attendances = await prisma.attendance.count({
      where: { studentId: userId },
    });
    if (attendances > 0) {
      dependencies.push(`${attendances} registro(s) de asistencia`);
    }

    // Verificar evaluaciones
    const evaluations = await prisma.evaluation.count({
      where: { studentId: userId },
    });
    if (evaluations > 0) {
      dependencies.push(`${evaluations} evaluación(es)`);
    }

    // Verificar pagos
    const payments = await prisma.payment.count({
      where: { studentId: userId },
    });
    if (payments > 0) {
      dependencies.push(`${payments} pago(s)`);
    }

    // Verificar vestuarios como instructor
    const costumes = await prisma.costume.count({
      where: { instructorId: userId },
    });
    if (costumes > 0) {
      dependencies.push(`${costumes} vestuario(s) asignado(s)`);
    }

    // Verificar coreografías como instructor
    const choreographies = await prisma.choreography.count({
      where: { instructorId: userId },
    });
    if (choreographies > 0) {
      dependencies.push(`${choreographies} coreografía(s) asignada(s)`);
    }

    // Verificar participaciones en coreografías
    const choreographyParticipations = await prisma.choreographyParticipant.count({
      where: { studentId: userId },
    });
    if (choreographyParticipations > 0) {
      dependencies.push(`${choreographyParticipations} participación(es) en coreografía(s)`);
    }

    // Verificar documentos como estudiante
    const documents = await prisma.document.count({
      where: { studentId: userId },
    });
    if (documents > 0) {
      dependencies.push(`${documents} documento(s)`);
    }

    // Verificar documentos registrados
    const registeredDocuments = await prisma.document.count({
      where: { registeredById: userId },
    });
    if (registeredDocuments > 0) {
      dependencies.push(`${registeredDocuments} documento(s) registrado(s)`);
    }

    // Verificar horarios de clase como instructor
    const classSchedules = await prisma.classSchedule.count({
      where: { instructorId: userId },
    });
    if (classSchedules > 0) {
      dependencies.push(`${classSchedules} horario(s) de clase asignado(s)`);
    }

    // Si hay dependencias, no permitir eliminar
    if (dependencies.length > 0) {
      return NextResponse.json({
        ok: false,
        error: "No se puede eliminar el usuario",
        dependencies: dependencies,
        message: "El usuario tiene registros relacionados que impiden su eliminación. Por favor, elimine o reasigne estos registros primero."
      }, { status: 400 });
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario eliminado correctamente"
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
