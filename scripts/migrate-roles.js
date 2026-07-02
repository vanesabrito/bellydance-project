const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateRoles() {
  try {
    console.log("Migrando roles de usuarios usando SQL directo...");

    // Paso 1: Agregar nuevos valores al enum Role
    console.log("Agregando nuevos valores al enum Role...");
    await prisma.$executeRaw`
      ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DIRECTORA_ACADEMICA'
    `;
    await prisma.$executeRaw`
      ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PROFESORA'
    `;
    await prisma.$executeRaw`
      ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ALUMNA'
    `;
    console.log("Nuevos valores agregados al enum Role");

    // Paso 2: Migrar COORDINATOR -> DIRECTORA_ACADEMICA
    const result1 = await prisma.$executeRaw`
      UPDATE "User" 
      SET role = 'DIRECTORA_ACADEMICA'::"Role" 
      WHERE role = 'COORDINATOR'::"Role"
    `;
    console.log(`Actualizados ${result1} usuarios de COORDINATOR a DIRECTORA_ACADEMICA`);

    // Paso 3: Migrar INSTRUCTOR -> PROFESORA
    const result2 = await prisma.$executeRaw`
      UPDATE "User" 
      SET role = 'PROFESORA'::"Role" 
      WHERE role = 'INSTRUCTOR'::"Role"
    `;
    console.log(`Actualizados ${result2} usuarios de INSTRUCTOR a PROFESORA`);

    // Paso 4: Migrar STUDENT -> ALUMNA
    const result3 = await prisma.$executeRaw`
      UPDATE "User" 
      SET role = 'ALUMNA'::"Role" 
      WHERE role = 'STUDENT'::"Role"
    `;
    console.log(`Actualizados ${result3} usuarios de STUDENT a ALUMNA`);

    console.log("Migración de roles completada exitosamente");
    console.log("NOTA: Los valores antiguos del enum (COORDINATOR, INSTRUCTOR, STUDENT) todavía existen en la base de datos.");
    console.log("Prisma db push debería poder eliminarlos ahora que no hay usuarios con esos roles.");
  } catch (err) {
    console.error("Error durante la migración:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

migrateRoles();
