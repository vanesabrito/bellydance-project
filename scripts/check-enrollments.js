const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkEnrollments() {
  try {
    console.log("Verificando inscripciones de alumnas...");
    
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            edad: true,
            cedula: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            instructor: {
              select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    console.log(`Total de inscripciones encontradas: ${enrollments.length}`);
    
    if (enrollments.length > 0) {
      console.log("\nLista de inscripciones:");
      enrollments.forEach((enrollment, index) => {
        console.log(`${index + 1}. Alumna: ${enrollment.student.nombre} ${enrollment.student.apellido}`);
        console.log(`   Email: ${enrollment.student.email}`);
        console.log(`   Clase: ${enrollment.class.name}`);
        console.log(`   Profesora: ${enrollment.class.instructor.nombre} ${enrollment.class.instructor.apellido}`);
        console.log(`   Status: ${enrollment.status}`);
        console.log(`   Categoría de edad: ${enrollment.ageCategory}`);
        console.log(`   Nivel académico: ${enrollment.academicLevel}`);
        console.log("");
      });
    } else {
      console.log("No hay inscripciones en la base de datos.");
    }
  } catch (err) {
    console.error("Error al verificar inscripciones:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollments();
