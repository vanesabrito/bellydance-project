const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpass";

async function run() {
  try {
    console.log("Seeding database for Bellydance Project Academy...");
    console.log("Available Prisma models:", Object.keys(prisma).filter(key => typeof prisma[key] === 'object' && prisma[key] !== null));

    // Crear roles en la tabla Role
    const roles = [
      { id: 'role_admin', nombre: 'ADMINISTRADOR', descripcion: 'Rol con acceso total al sistema' },
      { id: 'role_directora', nombre: 'DIRECTORA_ACADEMICA', descripcion: 'Rol encargado de gestión académica' },
      { id: 'role_profesora', nombre: 'PROFESORA', descripcion: 'Rol encargado de enseñanza y coreografías' },
      { id: 'role_alumna', nombre: 'ALUMNA', descripcion: 'Rol de estudiante del sistema' }
    ];

    for (const role of roles) {
      const existingRole = await prisma.Role.findUnique({
        where: { id: role.id },
      });
      if (!existingRole) {
        await prisma.Role.create({
          data: role,
        });
        console.log(`Created role: ${role.nombre}`);
      }
    }

    // Crear admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });
    if (!existingAdmin) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const adminUser = await prisma.user.create({
        data: { 
          email: ADMIN_EMAIL, 
          password: hash, 
          roleId: 'role_admin',
          nombre: "Administrador",
          apellido: "Sistema",
          cedula: "00000000",
          fechaNacimiento: new Date("1990-01-01"),
          edad: 34
        },
      });
      
      // Crear entrada en Administrador
      await prisma.administrador.create({
        data: {
          userId: adminUser.id,
        },
      });
      
      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    } else {
      console.log("Admin already exists:", ADMIN_EMAIL);
    }

    // Crear directora académica
    const directoraEmail = "directora@bellydance.com";
    const existingDirectora = await prisma.user.findUnique({
      where: { email: directoraEmail },
    });
    if (!existingDirectora) {
      const hash = await bcrypt.hash("directorapass", 10);
      const directoraUser = await prisma.user.create({
        data: { 
          email: directoraEmail, 
          password: hash, 
          roleId: 'role_directora',
          nombre: "Directora",
          apellido: "Académica",
          cedula: "12345678",
          fechaNacimiento: new Date("1985-05-15"),
          edad: 39
        },
      });
      
      // Crear entrada en DirectoraAcademica
      await prisma.directoraAcademica.create({
        data: {
          userId: directoraUser.id,
        },
      });
      
      console.log(`Created directora académica user: ${directoraEmail}`);
    }

    // Crear profesoras: Mariana, Veronica, Isabella
    const profesoras = [
      { nombre: "Mariana", apellido: "Rodríguez", email: "mariana@bellydance.com", cedula: "10000001" },
      { nombre: "Veronica", apellido: "Sánchez", email: "veronica@bellydance.com", cedula: "10000002" },
      { nombre: "Isabella", apellido: "Martínez", email: "isabella@bellydance.com", cedula: "10000003" }
    ];

    let profesora = null;
    for (const p of profesoras) {
      const existingProfesora = await prisma.user.findUnique({
        where: { email: p.email },
      });
      if (!existingProfesora) {
        const hash = await bcrypt.hash("profesorapass", 10);
        profesora = await prisma.user.create({
          data: { 
            email: p.email, 
            password: hash, 
            roleId: 'role_profesora',
            nombre: p.nombre,
            apellido: p.apellido,
            cedula: p.cedula,
            fechaNacimiento: new Date("1990-03-20"),
            edad: 34
          },
        });
        
        // Crear entrada en Profesora
        await prisma.profesora.create({
          data: {
            userId: profesora.id,
          },
        });
        
        console.log(`Created profesora user: ${p.email}`);
      } else {
        profesora = existingProfesora;
      }
    }

    // Crear clase de ejemplo
    const existingClass = await prisma.class.findFirst({
      where: { name: "Bellydance Básico" },
    });
    let danceClass = existingClass;
    if (!existingClass) {
      // Obtener el ID de Profesora para el instructor
      const profesoraRecord = await prisma.profesora.findFirst({
        where: { userId: profesora.id },
      });
      
      danceClass = await prisma.class.create({
        data: {
          name: "Bellydance Básico",
          description: "Clase introductoria al bellydance",
          instructorId: profesoraRecord.id,
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

    // Crear alumna de ejemplo
    const alumnaEmail = "alumna@bellydance.com";
    const existingAlumna = await prisma.user.findUnique({
      where: { email: alumnaEmail },
    });
    if (!existingAlumna) {
      const hash = await bcrypt.hash("alumnapass", 10);
      const alumnaUser = await prisma.user.create({
        data: { 
          email: alumnaEmail, 
          password: hash, 
          roleId: 'role_alumna',
          nombre: "Laura",
          apellido: "Martínez",
          cedula: "11223344",
          fechaNacimiento: new Date("2000-08-10"),
          edad: 24
        },
      });
      
      // Crear entrada en Alumna
      const alumnaRecord = await prisma.alumna.create({
        data: {
          userId: alumnaUser.id,
        },
      });
      
      console.log(`Created alumna user: ${alumnaEmail}`);

      // Inscribir a la alumna en la clase
      if (danceClass) {
        await prisma.enrollment.create({
          data: {
            studentId: alumnaRecord.id,
            classId: danceClass.id,
            status: "APPROVED",
          },
        });
        console.log("Enrolled alumna in the class");
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
