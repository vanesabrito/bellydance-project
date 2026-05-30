const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkCedulas() {
  try {
    console.log("Verificando cédulas duplicadas...");
    
    const duplicates = await prisma.$queryRaw`
      SELECT id, email, cedula 
      FROM "User" 
      WHERE cedula IS NOT NULL 
      GROUP BY cedula, id, email 
      HAVING COUNT(*) > 1
    `;
    
    console.log("Cédulas duplicadas:", duplicates);
    
    const nulls = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "User" 
      WHERE cedula IS NULL
    `;
    
    console.log("Usuarios con cédula NULL:", nulls[0]);
    
    const allUsers = await prisma.$queryRaw`
      SELECT id, email, cedula 
      FROM "User"
    `;
    
    console.log("Todos los usuarios con cédula:");
    console.log(allUsers);
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCedulas();
