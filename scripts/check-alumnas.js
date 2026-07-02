const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAlumnas() {
  try {
    console.log("Verificando alumnas registradas en la base de datos...");
    
    const alumnas = await prisma.user.findMany({
      where: { role: "ALUMNA" },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        edad: true,
        cedula: true,
      },
    });

    console.log(`Total de alumnas encontradas: ${alumnas.length}`);
    
    if (alumnas.length > 0) {
      console.log("\nLista de alumnas:");
      alumnas.forEach((alumna, index) => {
        console.log(`${index + 1}. ${alumna.nombre} ${alumna.apellido}`);
        console.log(`   Email: ${alumna.email}`);
        console.log(`   Cédula: ${alumna.cedula}`);
        console.log(`   Edad: ${alumna.edad}`);
        console.log(`   ID: ${alumna.id}`);
        console.log("");
      });
    } else {
      console.log("No hay alumnas registradas en la base de datos.");
    }
  } catch (err) {
    console.error("Error al verificar alumnas:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlumnas();
