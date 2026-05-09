const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpass";

async function run() {
  try {
    console.log("Seeding database for Bellydance Project Academy...");

    // Crear admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });
    if (!existingAdmin) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await prisma.user.create({
        data: { email: ADMIN_EMAIL, password: hash, role: "ADMIN" },
      });
      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    } else {
      console.log("Admin already exists:", ADMIN_EMAIL);
    }

    // Crear coordinador
    const coordEmail = "coordinator@bellydance.com";
    const existingCoord = await prisma.user.findUnique({
      where: { email: coordEmail },
    });
    if (!existingCoord) {
      const hash = await bcrypt.hash("coordpass", 10);
      await prisma.user.create({
        data: { email: coordEmail, password: hash, role: "COORDINATOR" },
      });
      console.log(`Created coordinator user: ${coordEmail}`);
    }

    // Crear instructor
    const instructorEmail = "instructor@bellydance.com";
    let instructor = await prisma.user.findUnique({
      where: { email: instructorEmail },
    });
    if (!instructor) {
      const hash = await bcrypt.hash("instructorpass", 10);
      instructor = await prisma.user.create({
        data: { email: instructorEmail, password: hash, role: "INSTRUCTOR" },
      });
      console.log(`Created instructor user: ${instructorEmail}`);
    }

    // Crear clase de ejemplo
    const existingClass = await prisma.class.findFirst({
      where: { name: "Bellydance Básico" },
    });
    if (!existingClass) {
      const danceClass = await prisma.class.create({
        data: {
          name: "Bellydance Básico",
          description: "Clase introductoria al bellydance",
          instructorId: instructor.id,
        },
      });
      console.log(`Created class: ${danceClass.name}`);

      // Crear horario para la clase
      await prisma.schedule.create({
        data: {
          classId: danceClass.id,
          dayOfWeek: "MONDAY",
          startTime: "18:00",
          endTime: "19:30",
          location: "Sala A",
        },
      });
      console.log("Created schedule for the class");
    }

    // Crear estudiante de ejemplo
    const studentEmail = "student@bellydance.com";
    const existingStudent = await prisma.user.findUnique({
      where: { email: studentEmail },
    });
    if (!existingStudent) {
      const hash = await bcrypt.hash("studentpass", 10);
      const student = await prisma.user.create({
        data: { email: studentEmail, password: hash, role: "STUDENT" },
      });
      console.log(`Created student user: ${studentEmail}`);

      // Inscribir al estudiante en la clase
      const danceClass = await prisma.class.findFirst({
        where: { name: "Bellydance Básico" },
      });
      if (danceClass) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: danceClass.id,
            status: "APPROVED",
          },
        });
        console.log("Enrolled student in the class");
      }
    }

  } catch (err) {
    console.error("Seed error", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
