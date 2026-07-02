const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log("Verificando usuarios en la base de datos...");
    
    const directora = await prisma.user.findMany({
      where: { role: "DIRECTORA_ACADEMICA" }
    });
    console.log("Directoras académicas:", directora);
    
    const profesoras = await prisma.user.findMany({
      where: { role: "PROFESORA" }
    });
    console.log("Profesoras:", profesoras);
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
