const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupOldUsers() {
  try {
    console.log("Eliminando usuarios antiguos...");
    
    // Obtener la nueva profesora Mariana para usarla como instructora
    const mariana = await prisma.user.findUnique({
      where: { email: "mariana@bellydance.com" }
    });
    
    if (mariana) {
      // Actualizar clases que tienen como instructor a usuarios antiguos
      const updatedClasses = await prisma.class.updateMany({
        where: {
          instructorId: {
            in: ["cmp7vev940002n4tr4xjcm62h", "cmpt95fv100012e6mpxlolrs3"] // IDs de profesoras antiguas
          }
        },
        data: {
          instructorId: mariana.id
        }
      });
      console.log(`Actualizadas ${updatedClasses.count} clases para usar a Mariana como instructora`);
    }
    
    // Eliminar directora académica antigua
    const oldDirectora = await prisma.user.deleteMany({
      where: { email: "coordinator@bellydance.com" }
    });
    console.log(`Eliminados ${oldDirectora.count} directora académica antigua`);
    
    // Eliminar profesoras antiguas
    const oldProfesoras = await prisma.user.deleteMany({
      where: {
        email: {
          in: ["instructor@bellydance.com", "profesora@bellydance.com"]
        }
      }
    });
    console.log(`Eliminadas ${oldProfesoras.count} profesoras antiguas`);
    
    console.log("Limpieza completada");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldUsers();
