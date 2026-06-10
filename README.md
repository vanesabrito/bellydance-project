# Bellydance Project - Gestión de Academia de Baile

Aplicación en **Next.js 14 (App Router)** + **TypeScript** para gestionar **inscripciones y clases** en la academia de baile Bellydance Project, lista para correr con **Docker + PostgreSQL**.

## Descripción del Sistema

El sistema de gestión de la academia de baile Bellydance Project es una aplicación web completa y profesional que permite administrar usuarios, clases, inscripciones, documentos, pagos, asistencia, evaluaciones y clasificación académica. El sistema está diseñado para trabajar con cuatro roles principales: Administrador, Directora Académica, Profesora y Alumna.

### Características Principales

- **Gestión de Usuarios**: Registro y administración de usuarios con diferentes roles y permisos
- **Sistema de Inscripciones**: Flujo completo de solicitud, revisión y aprobación de inscripciones
- **Clasificación Académica**: Sistema automático de clasificación por edad y nivel académico
- **Gestión de Clases**: Administración de clases, horarios y asignación de profesoras
- **Control de Asistencia**: Registro y seguimiento de asistencia de alumnas
- **Evaluaciones**: Sistema de evaluación del progreso de las alumnas
- **Gestión de Coreografías**: Creación y gestión de coreografías para presentaciones
- **Diseño de Vestuarios**: Administración de vestuarios para coreografías
- **Gestión de Documentos**: Control de documentos requeridos por las alumnas
- **Control de Pagos**: Registro y seguimiento de pagos
- **Reportes y Estadísticas**: Dashboard con métricas y exportación de reportes
- **Recuperación de Contraseña**: Sistema seguro de recuperación de contraseña con tokens

## Roles del Sistema

### 1. Administrador (ADMIN)
El administrador tiene control total del sistema y puede realizar todas las operaciones:

**Funcionalidades:**
- **Gestión de Usuarios**: Registrar nuevos usuarios, ver lista de usuarios registrados, asignar roles (Administrador, Directora Académica, Profesora, Alumna)
- **Gestión de Inscripciones**: Ver todas las inscripciones, aprobar/rechazar inscripciones, agregar notas de revisión, clasificación automática por edad y nivel
- **Lista de Alumnas Inscritas**: Ver alumnas aprobadas organizadas por categoría de edad y nivel académico, reubicar alumnas entre niveles
- **Clasificación Académica**: Ver estadísticas de clasificación por categoría y nivel, gestionar niveles académicos
- **Gestión de Documentos**: Recepción de documentos, entrega de documentos, control de estados
- **Control de Pagos**: Ver pagos realizados, registrar nuevos pagos, generar reportes de pagos
- **Reportes**: Acceder a estadísticas del sistema, exportar reportes CSV, ver métricas de usuarios e inscripciones

**Credenciales por defecto:**
- Email: `admin@example.com`
- Password: `adminpass`

### 2. Directora Académica (DIRECTORA_ACADEMICA)
La directora académica gestiona los aspectos académicos y logísticos de la academia:

**Funcionalidades:**
- **Gestión de Eventos**: Crear y administrar eventos académicos (presentaciones, recitales, talleres especiales)
- **Control de Asistencias**: Registrar y controlar la asistencia de las alumnas a las clases, agregar observaciones detalladas
- **Revisión de Inscripciones**: Aprobar/rechazar inscripciones de alumnas, agregar notas de revisión, clasificación automática por edad y nivel
- **Lista de Alumnas Inscritas**: Ver alumnas aprobadas organizadas por categoría de edad y nivel académico, reubicar alumnas entre niveles
- **Reportes Académicos**: Ver estadísticas de inscripciones, asistencia y clasificación académica

**Credenciales por defecto:**
- Email: `directora@bellydance.com`
- Password: `directorapass`

### 3. Profesora (PROFESORA)
Las profesoras son responsables de la enseñanza y gestión de sus clases:

**Funcionalidades:**
- **Gestión de Clases**: Ver y gestionar las clases asignadas, ver lista de alumnas inscritas, subir material de apoyo (videos, música, documentos)
- **Registro de Asistencia**: Registrar asistencia de alumnas a sus clases, agregar observaciones detalladas por estudiante
- **Evaluaciones**: Evaluar el progreso de las alumnas, asignar notas, agregar comentarios y notas de progreso
- **Creación de Coreografías**: Diseñar y gestionar coreografías para presentaciones, subir videos y música
- **Diseño de Vestuarios**: Crear y gestionar diseños de vestuarios para las coreografías

**Profesoras actuales:**
- Mariana Rodríguez (`mariana@bellydance.com`) - Password: `profesorapass`
- Veronica Sánchez (`veronica@bellydance.com`) - Password: `profesorapass`
- Isabella Martínez (`isabella@bellydance.com`) - Password: `profesorapass`

### 4. Alumna (ALUMNA)
Las alumnas son las estudiantes que participan en las clases de la academia:

**Funcionalidades:**
- **Registro**: Registrarse en el sistema con datos personales (nombre, apellido, cédula, fecha de nacimiento, edad, dirección, email, contraseña)
- **Recuperación de Contraseña**: Recuperar contraseña mediante enlace enviado al email con token seguro
- **Inscripción a Clases**: Ver clases disponibles y solicitar inscripción
- **Mis Inscripciones**: Ver el estado de sus inscripciones (Pendiente, Aprobada, Rechazada), ver clasificación académica asignada
- **Documentos**: Subir documentos requeridos, ver estado de documentos entregados
- **Planilla de Inscripción**: Ver y descargar planilla de inscripción con sus datos personales en formato PDF

**Datos de registro requeridos:**
- Nombre
- Apellido
- Número de Cédula (único)
- Correo electrónico (único)
- Fecha de Nacimiento
- Edad
- Dirección
- Contraseña

## Flujo General del Sistema

1. **Inicialización**: Al levantar el sistema, se crea automáticamente el usuario administrador y los usuarios base (directora académica y profesoras)
2. **Registro de Alumnas**: Las alumnas se registran en `/register` con todos sus datos personales
3. **Autenticación**: Usuarios inician sesión en `/login` con sus credenciales
4. **Inscripción a Clases**: Las alumnas ven clases disponibles y solicitan inscripción desde `/student/enroll`
5. **Revisión de Inscripciones**: La directora académica o administrador revisa las inscripciones y las aprueba/rechaza
6. **Gestión Académica**: Las profesoras gestionan sus clases, coreografías y vestuarios
7. **Control de Asistencia**: La directora académica registra y controla la asistencia
8. **Gestión de Documentos**: Las alumnas suben documentos, el administrador los revisa
9. **Control de Pagos**: El administrador gestiona los pagos de las alumnas
10. **Reportes**: El administrador y directora académica acceden a estadísticas y reportes

## Vistas del Sistema

Esta sección describe las vistas principales de la aplicación según el rol del usuario.

### Vistas Generales

- **Pantalla de Login** (`/login`)
  - Formulario con campos de email y contraseña
  - Botón para iniciar sesión y enlace para registrarse
  - Redirección automática al dashboard según el rol del usuario

- **Página de Registro** (`/register`)
  - Formulario completo para alumnas con campos: nombre, apellido, cédula, email, fecha de nacimiento, edad, dirección, contraseña
  - Validación de campos obligatorios
  - Verificación de email y cédula únicos

### Vistas por Rol

#### Vistas de Alumna

- **Dashboard de Alumna** (`/dashboard`)
  - Sidebar con enlaces a "Inscribirse" y "Mis Inscripciones"
  - Tarjetas con resumen (clases inscritas, pendientes, aprobadas)

- **Inscripción a Clases** (`/student/enroll`)
  - Lista de clases disponibles con descripción
  - Horarios y profesoras asignadas
  - Formulario para solicitar inscripción

- **Mis Inscripciones** (`/student/enrollments`)
  - Tabla con inscripciones de la alumna
  - Estados: Pendiente, Aprobada, Rechazada
  - Notas de revisión y fecha de última revisión
  - Chips de colores para cada estado

#### Vistas de Profesora

- **Gestión de Clases** (`/profesora/classes`)
  - Lista de clases asignadas a la profesora
  - Detalles de cada clase (nombre, descripción, horario)
  - Lista de alumnas inscritas en cada clase
  - Información de asistencia

- **Gestión de Coreografías** (`/profesora/choreographies`)
  - Lista de coreografías creadas
  - Formulario para crear nuevas coreografías
  - Asignación de coreografías a clases
  - Detalles de cada coreografía

- **Gestión de Vestuarios** (`/profesora/costumes`)
  - Lista de diseños de vestuarios
  - Formulario para crear nuevos diseños
  - Asignación de vestuarios a coreografías
  - Detalles de cada vestuario

#### Vistas de Directora Académica

- **Gestión de Eventos** (`/directora/events`)
  - Lista de eventos académicos (presentaciones, recitales, talleres)
  - Formulario para crear nuevos eventos
  - Detalles de cada evento (fecha, lugar, participantes)
  - Estado de los eventos

- **Control de Asistencias** (`/directora/attendance`)
  - Registro de asistencia por clase
  - Estadísticas de asistencia
  - Reportes de ausencias
  - Filtros por fecha y clase

#### Vistas de Administrador

- **Gestión de Usuarios** (`/admin/users`)
  - Tabla con todos los usuarios del sistema
  - Botón "Registrar Usuario" para crear nuevos usuarios
  - Formulario con todos los campos y selector de rol
  - Información de email, rol y fecha de alta

- **Gestión de Inscripciones** (`/admin/enrollments`)
  - Tabla con todas las inscripciones del sistema
  - Filtros por estado, fecha y alumna
  - Botones para aprobar/rechazar inscripciones
  - Campo para notas de revisión

- **Gestión de Documentos** (`/admin/documents`)
  - Recepción de documentos subidos por alumnas
  - Control de estados de documentos
  - Entrega de documentos a alumnas
  - Historial de documentos

- **Control de Pagos** (`/admin/payments`)
  - Registro de pagos realizados
  - Formulario para registrar nuevos pagos
  - Historial de pagos por alumna
  - Reportes de pagos pendientes

- **Dashboard de Reportes** (`/admin/reports`)
  - Tarjetas con métricas (usuarios, alumnas, inscripciones, pagos)
  - Tabla de inscripciones recientes
  - Botón "Exportar CSV" para reportes
  - Estadísticas detalladas del sistema

## Tecnologías principales

- **Next.js 14 (App Router) + React 18 + TypeScript**
- **NextAuth** con **Credentials provider** para login por email/contraseña
- **PostgreSQL** vía `pg` y **Prisma ORM**
- **Dockerfile** y **docker-compose** para levantar **db + web**
- Seed script que crea usuarios base (administrador, directora académica, profesoras)
- Estructura de componentes siguiendo **Atomic Design**:
  - `atoms` → componentes muy pequeños (botones, inputs, etc.)
  - `molecules` → combinaciones simples de átomos
  - `organisms` → bloques más grandes de UI (layouts, secciones de página)

## Diagrama de Dominio del Sistema

El diagrama de dominio muestra las entidades principales del sistema y sus relaciones.

### Diagrama de Entidades y Relaciones

```mermaid
graph LR
    A1[Administrador] -->|1:N revisa| D[Inscripción]
    A2[Directora Académica] -->|1:N revisa| D
    A3[Profesora] -->|1:N imparte| B[Clase]
    A4[Alumna] -->|1:N solicita| D
    
    B -->|1:N tiene| D
    B -->|1:N tiene| C[Horario]
    B -->|1:N tiene| E[Evaluación]
    B -->|1:N tiene| F[Asistencia]
    
    D -->|N:1 pertenece| A4
    D -->|N:1 pertenece| B
    C -->|N:1 pertenece| B
    E -->|N:1 pertenece| B
    E -->|N:1 pertenece| A4
    F -->|N:1 pertenece| B
    F -->|N:1 pertenece| A4
    
    A4 -->|1:N realiza| F
    A4 -->|1:N recibe| E
    
    B -->|1:N tiene| G[Coreografía]
    G -->|1:N tiene| H[Vestuario]
    G -->|1:N tiene| I[Participante]
    I -->|N:1 es| A4
    
    style A1 fill:#ffcccc
    style A2 fill:#ffebcc
    style A3 fill:#ccffcc
    style A4 fill:#e6ccff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#fce4ec
    style E fill:#e3f2fd
    style F fill:#f3e5f5
    style G fill:#fff9c4
    style H fill:#ffe0b2
    style I fill:#c8e6c9
```

**Cardinalidades de las relaciones por rol:**

- **Administrador → Inscripción (1:N)**: Un administrador puede revisar muchas inscripciones
- **Directora Académica → Inscripción (1:N)**: Una directora puede revisar muchas inscripciones
- **Profesora → Clase (1:N)**: Una profesora puede impartir muchas clases
- **Alumna → Inscripción (1:N)**: Una alumna puede solicitar muchas inscripciones
- **Alumna → Asistencia (1:N)**: Una alumna tiene registros de asistencia
- **Alumna → Evaluación (1:N)**: Una alumna recibe evaluaciones
- **Clase → Inscripción (1:N)**: Una clase puede tener muchas inscripciones
- **Clase → Horario (1:N)**: Una clase puede tener muchos horarios
- **Clase → Evaluación (1:N)**: Una clase puede tener muchas evaluaciones
- **Clase → Asistencia (1:N)**: Una clase puede tener registros de asistencia
- **Clase → Coreografía (1:N)**: Una clase puede tener muchas coreografías
- **Inscripción → Alumna (N:1)**: Una inscripción pertenece a una sola alumna
- **Inscripción → Clase (N:1)**: Una inscripción pertenece a una sola clase
- **Horario → Clase (N:1)**: Un horario pertenece a una sola clase
- **Evaluación → Alumna (N:1)**: Una evaluación pertenece a una sola alumna
- **Evaluación → Clase (N:1)**: Una evaluación pertenece a una sola clase
- **Asistencia → Alumna (N:1)**: Un registro de asistencia pertenece a una sola alumna
- **Asistencia → Clase (N:1)**: Un registro de asistencia pertenece a una sola clase

### Funcionalidades por Rol en el Modelo de Dominio

**Nota: Las funcionalidades marcadas como (IMPLEMENTADO) están completamente funcionales. Las marcadas como (PLACEHOLDER) tienen la página creada pero sin funcionalidad implementada aún.**

#### Administrador
- **Gestión de Usuarios (IMPLEMENTADO)**: Registrar nuevos usuarios con formulario completo, ver lista de usuarios, asignar roles (ADMIN, DIRECTORA_ACADEMICA, PROFESORA, ALUMNA)
- **Gestión de Inscripciones (IMPLEMENTADO)**: Ver todas las inscripciones del sistema, aprobar/rechazar inscripciones, agregar notas de revisión, clasificación automática por edad y nivel al aprobar
- **Lista de Alumnas Inscritas (IMPLEMENTADO)**: Ver alumnas aprobadas organizadas por categoría de edad y nivel académico (9 categorías), reubicar alumnas entre niveles, filtros y búsqueda
- **Clasificación Académica (IMPLEMENTADO)**: Ver estadísticas de clasificación por categoría y nivel, gestión de niveles académicos
- **Gestión de Documentos (PLACEHOLDER)**: Página creada para gestión de documentos (pendiente de implementación)
- **Control de Pagos (IMPLEMENTADO)**: Registrar pagos de alumnas con fecha, monto, tipo de pago (efectivo, pago móvil, transferencia), número de referencia y banco
- **Reportes (IMPLEMENTADO)**: Acceder a estadísticas del sistema, exportar reportes CSV, ver métricas de usuarios e inscripciones

#### Directora Académica
- **Gestión de Eventos (IMPLEMENTADO)**: Crear, ver y eliminar eventos académicos (presentaciones, recitales, talleres especiales)
- **Control de Asistencias (IMPLEMENTADO)**: Registrar asistencia de alumnas a clases, ver historial de asistencias, agregar observaciones detalladas por estudiante
- **Revisión de Inscripciones (IMPLEMENTADO)**: Aprobar/rechazar inscripciones de alumnas, agregar notas de revisión, clasificación automática por edad y nivel (compartido con ADMIN)
- **Lista de Alumnas Inscritas (IMPLEMENTADO)**: Ver alumnas aprobadas organizadas por categoría de edad y nivel académico (9 categorías), reubicar alumnas entre niveles, filtros y búsqueda
- **Reportes Académicos (IMPLEMENTADO)**: Ver estadísticas de inscripciones, asistencia y clasificación académica

#### Profesora
- **Gestión de Clases (IMPLEMENTADO)**: Ver y gestionar las clases asignadas, ver lista de alumnas inscritas, subir material de apoyo (videos, música, documentos)
- **Registro de Asistencia (IMPLEMENTADO)**: Registrar asistencia de alumnas a sus clases, agregar observaciones detalladas por estudiante
- **Evaluaciones (IMPLEMENTADO)**: Evaluar el progreso de las alumnas, asignar notas, agregar comentarios y notas de progreso
- **Gestión de Coreografías (IMPLEMENTADO)**: Crear, ver y gestionar coreografías, asignar a clases, subir videos y música, gestionar participantes
- **Gestión de Vestuarios (IMPLEMENTADO)**: Crear, ver y gestionar diseños de vestuarios, asignar a coreografías, gestionar estados

#### Alumna
- **Registro (IMPLEMENTADO)**: Registrarse en el sistema con datos personales completos (nombre, apellido, cédula, email, fecha de nacimiento, edad, dirección, contraseña)
- **Recuperación de Contraseña (IMPLEMENTADO)**: Recuperar contraseña mediante enlace enviado al email con token seguro y expiración
- **Inscripción a Clases (IMPLEMENTADO)**: Ver clases disponibles y solicitar inscripción
- **Mis Inscripciones (IMPLEMENTADO)**: Ver el estado de sus inscripciones (Pendiente, Aprobada, Rechazada), ver notas de revisión y fecha de revisión, ver clasificación académica asignada
- **Planilla de Inscripción (IMPLEMENTADO)**: Ver y descargar planilla de inscripción con sus datos personales en formato PDF

### Explicación del Modelo de Dominio

El sistema de gestión de la academia de baile Bellydance Project se basa en múltiples entidades que interactúan entre sí:

#### 1. Usuario (User)
Representa a todas las personas que interactúan con el sistema. Cada usuario tiene un rol específico que determina sus permisos y funcionalidades.

**Campos principales:**
- `id`: Identificador único del usuario
- `email`: Correo electrónico (único, usado para login)
- `password`: Contraseña hasheada
- `role`: Rol del usuario (ADMIN, DIRECTORA_ACADEMICA, PROFESORA, ALUMNA)
- `nombre`: Nombre del usuario
- `apellido`: Apellido del usuario
- `cedula`: Número de cédula (único)
- `fechaNacimiento`: Fecha de nacimiento
- `edad`: Edad del usuario
- `direccion`: Dirección física
- `resetToken`: Token para recuperación de contraseña
- `resetTokenExpires`: Fecha de expiración del token de recuperación
- `createdAt`: Fecha de creación del registro

**Roles:**
- **ADMIN**: Tiene control total del sistema
- **DIRECTORA_ACADEMICA**: Gestiona aspectos académicos y logísticos
- **PROFESORA**: Imparte clases y gestiona coreografías/vestuarios
- **ALUMNA**: Estudiante que se inscribe a clases

#### 2. Clase (Class)
Representa una clase de baile que se imparte en la academia.

**Campos principales:**
- `id`: Identificador único de la clase
- `name`: Nombre de la clase
- `description`: Descripción detallada de la clase
- `instructorId`: ID de la profesora que imparte la clase (relación con User)
- `supportMaterial`: Material de apoyo (JSON con URLs de videos, música, documentos)
- `createdAt`: Fecha de creación del registro

#### 3. Horario (Schedule)
Representa los horarios en los que se imparten las clases.

**Campos principales:**
- `id`: Identificador único del horario
- `classId`: ID de la clase a la que pertenece el horario (relación con Class)
- `dayOfWeek`: Día de la semana (LUNES a DOMINGO)
- `startTime`: Hora de inicio (formato HH:MM)
- `endTime`: Hora de fin (formato HH:MM)
- `location`: Ubicación donde se imparte la clase
- `createdAt`: Fecha de creación del registro

#### 4. Inscripción (Enrollment)
Representa la solicitud de una alumna para inscribirse a una clase.

**Campos principales:**
- `id`: Identificador único de la inscripción
- `studentId`: ID de la alumna que solicita la inscripción (relación con User)
- `classId`: ID de la clase a la que se quiere inscribir (relación con Class)
- `enrollmentDate`: Fecha en que se realizó la solicitud
- `status`: Estado de la inscripción (PENDING, APPROVED, REJECTED)
- `academicLevel`: Nivel académico (BASICO, INTERMEDIO, AVANZADO)
- `ageCategory`: Categoría de edad (MINI_BELLYDANCE, BELLYDANCE_ADOLESCENTES, BELLYDANCE_ADULTAS)
- `reviewNote`: Nota de revisión agregada por el revisor
- `reviewedAt`: Fecha en que se revisó la inscripción
- `reviewerId`: ID del usuario que revisó la inscripción (relación con User)
- `createdAt`: Fecha de creación del registro

**Estados de inscripción:**
- **PENDING**: Inscripción pendiente de revisión
- **APPROVED**: Inscripción aprobada
- **REJECTED**: Inscripción rechazada

**Niveles académicos:**
- **BASICO**: Nivel básico de aprendizaje
- **INTERMEDIO**: Nivel intermedio de aprendizaje
- **AVANZADO**: Nivel avanzado de aprendizaje

**Categorías de edad:**
- **MINI_BELLYDANCE**: Alumnas de 4 a 11 años
- **BELLYDANCE_ADOLESCENTES**: Alumnas de 12 a 17 años
- **BELLYDANCE_ADULTAS**: Alumnas de 18 años en adelante

#### 5. Asistencia (Attendance)
Representa el registro de asistencia de una alumna a una clase.

**Campos principales:**
- `id`: Identificador único del registro de asistencia
- `studentId`: ID de la alumna (relación con User)
- `classId`: ID de la clase (relación con Class)
- `date`: Fecha del registro de asistencia
- `present`: Indica si la alumna estuvo presente
- `note`: Nota breve sobre la asistencia
- `observations`: Observaciones detalladas sobre el desempeño de la alumna
- `createdAt`: Fecha de creación del registro

#### 6. Evaluación (Evaluation)
Representa la evaluación del progreso de una alumna en una clase.

**Campos principales:**
- `id`: Identificador único de la evaluación
- `studentId`: ID de la alumna evaluada (relación con User)
- `classId`: ID de la clase (relación con Class)
- `date`: Fecha de la evaluación
- `score`: Nota numérica (0-10)
- `comments`: Comentarios sobre el desempeño
- `progress`: Notas de progreso
- `createdAt`: Fecha de creación del registro

#### 7. Coreografía (Choreography)
Representa una coreografía diseñada para presentaciones.

**Campos principales:**
- `id`: Identificador único de la coreografía
- `name`: Nombre de la coreografía
- `description`: Descripción de la coreografía
- `level`: Nivel de dificultad
- `music`: URL de la música
- `videoUrl`: URL del video de referencia
- `duration`: Duración en minutos
- `status`: Estado (PRACTICE, DEVELOPMENT, READY_FOR_PRESENTATION)
- `instructorId`: ID de la profesora creadora (relación con User)
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización

#### 8. Vestuario (Costume)
Representa un diseño de vestuario para una coreografía.

**Campos principales:**
- `id`: Identificador único del vestuario
- `name`: Nombre del vestuario
- `description`: Descripción del diseño
- `color`: Color principal
- `imageUrl`: URL de la imagen del diseño
- `accessories`: Accesorios incluidos
- `estimatedCost`: Costo estimado
- `status`: Estado (DESIGN, APPROVED, REJECTED, IN_PRODUCTION, COMPLETED)
- `instructorId`: ID de la profesora diseñadora (relación con User)
- `choreographyId`: ID de la coreografía asociada (relación con Choreography)
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización

#### 9. Participante de Coreografía (ChoreographyParticipant)
Representa la participación de una alumna en una coreografía.

**Campos principales:**
- `id`: Identificador único de la participación
- `choreographyId`: ID de la coreografía (relación con Choreography)
- `studentId`: ID de la alumna participante (relación con User)
- `createdAt`: Fecha de creación del registro

### Flujo de Trabajo del Modelo

1. **Registro de Usuarios**: Las alumnas se registran en el sistema con sus datos personales. El administrador puede registrar usuarios con cualquier rol.

2. **Creación de Clases**: El administrador crea clases y las asigna a profesoras específicas.

3. **Definición de Horarios**: Cada clase tiene uno o más horarios definidos (día, hora, ubicación).

4. **Solicitud de Inscripción**: Las alumnas solicitan inscribirse a las clases disponibles. Esto crea un registro de inscripción con estado PENDING.

5. **Revisión y Clasificación de Inscripciones**: La directora académica o el administrador revisan las inscripciones, las aprueban o rechazan, y el sistema clasifica automáticamente por edad y nivel académico.

6. **Gestión Académica**: Las profesoras gestionan sus clases, registran asistencia, evalúan alumnas, crean coreografías y diseñan vestuarios.

7. **Clasificación Académica**: El sistema clasifica automáticamente a las alumnas por categoría de edad (Mini Bellydance 4-11, Adolescentes 12-17, Adultas 18+) y nivel académico (Básico, Intermedio, Avanzado).

8. **Gestión de Lista de Alumnas Inscritas**: Administradores y directoras pueden ver alumnas aprobadas organizadas en 9 categorías (3 categorías de edad × 3 niveles), reubicar alumnas entre niveles, y filtrar por categoría y nivel.

### Archivo PlantUML Adicional

Para una visualización más detallada, el diagrama también está disponible en formato PlantUML en el archivo `docs/domain-diagram.puml`.

**Para visualizar el diagrama PlantUML:**
1. Abre el archivo `docs/domain-diagram.puml` en un editor que soporte PlantUML
2. O usa una herramienta online como [PlantText](https://www.planttext.com/) o [PlantUML Online Editor](https://plantuml-editor.kkeisuke.com/)
3. Copia el contenido del archivo y pégalo en la herramienta online para generar el diagrama

## Diagramas de Casos de Uso

### Casos de Uso por Rol

#### Casos de Uso del Administrador

```mermaid
graph TD
    Admin[Administrador]
    CU1[Gestionar Usuarios]
    CU2[Gestionar Inscripciones]
    CU3[Lista de Alumnas Inscritas]
    CU4[Clasificación Académica]
    CU5[Gestionar Documentos]
    CU6[Controlar Pagos]
    CU7[Generar Reportes]
    CU8[Ver Estadísticas]
    
    Admin --> CU1
    Admin --> CU2
    Admin --> CU3
    Admin --> CU4
    Admin --> CU5
    Admin --> CU6
    Admin --> CU7
    Admin --> CU8
    
    CU1 --> CU1_1[Registrar Nuevo Usuario]
    CU1 --> CU1_2[Ver Lista de Usuarios]
    CU1 --> CU1_3[Asignar Rol]
    
    CU2 --> CU2_1[Ver Inscripciones]
    CU2 --> CU2_2[Aprobar Inscripción]
    CU2 --> CU2_3[Rechazar Inscripción]
    CU2 --> CU2_4[Agregar Nota de Revisión]
    CU2 --> CU2_5[Asignar Nivel Académico]
    
    CU3 --> CU3_1[Ver Alumnas Aprobadas]
    CU3 --> CU3_2[Ver por Categoría de Edad]
    CU3 --> CU3_3[Ver por Nivel Académico]
    CU3 --> CU3_4[Reubicar Alumna de Nivel]
    CU3 --> CU3_5[Filtrar y Buscar]
    
    CU4 --> CU4_1[Ver Estadísticas por Categoría]
    CU4 --> CU4_2[Ver Estadísticas por Nivel]
    CU4 --> CU4_3[Ver Distribución Combinada]
    
    CU5 --> CU5_1[Recibir Documentos]
    CU5 --> CU5_2[Revisar Documentos]
    CU5 --> CU5_3[Entregar Documentos]
    
    CU6 --> CU6_1[Registrar Pagos]
    CU6 --> CU6_2[Ver Historial de Pagos]
    CU6 --> CU6_3[Generar Reporte de Pagos]
    
    CU7 --> CU7_1[Exportar CSV]
    CU7 --> CU7_2[Ver Reportes Detallados]
    
    CU8 --> CU8_1[Ver Métricas de Usuarios]
    CU8 --> CU8_2[Ver Métricas de Inscripciones]
    CU8 --> CU8_3[Ver Métricas de Pagos]
    CU8 --> CU8_4[Ver Métricas de Clasificación]
```

#### Casos de Uso de la Directora Académica

```mermaid
graph TD
    Directora[Directora Académica]
    CU1[Gestionar Eventos]
    CU2[Controlar Asistencias]
    CU3[Revisar Inscripciones]
    CU4[Lista de Alumnas Inscritas]
    CU5[Ver Reportes Académicos]
    
    Directora --> CU1
    Directora --> CU2
    Directora --> CU3
    Directora --> CU4
    Directora --> CU5
    
    CU1 --> CU1_1[Crear Evento]
    CU1 --> CU1_2[Ver Lista de Eventos]
    CU1 --> CU1_3[Actualizar Evento]
    CU1 --> CU1_4[Eliminar Evento]
    
    CU2 --> CU2_1[Registrar Asistencia]
    CU2 --> CU2_2[Ver Estadísticas de Asistencia]
    CU2 --> CU2_3[Ver Reporte de Ausencias]
    CU2 --> CU2_4[Filtrar por Fecha y Clase]
    CU2 --> CU2_5[Agregar Observaciones Detalladas]
    
    CU3 --> CU3_1[Ver Inscripciones Pendientes]
    CU3 --> CU3_2[Aprobar Inscripción]
    CU3 --> CU3_3[Rechazar Inscripción]
    CU3 --> CU3_4[Agregar Nota de Revisión]
    CU3 --> CU3_5[Asignar Nivel Académico]
    
    CU4 --> CU4_1[Ver Alumnas Aprobadas]
    CU4 --> CU4_2[Ver por Categoría de Edad]
    CU4 --> CU4_3[Ver por Nivel Académico]
    CU4 --> CU4_4[Reubicar Alumna de Nivel]
    CU4 --> CU4_5[Filtrar y Buscar]
    
    CU5 --> CU5_1[Ver Estadísticas de Inscripciones]
    CU5 --> CU5_2[Ver Estadísticas de Asistencia]
    CU5 --> CU5_3[Ver Estadísticas de Clasificación]
    CU5 --> CU5_4[Exportar Reportes]
```

#### Casos de Uso de la Profesora

```mermaid
graph TD
    Profesora[Profesora]
    CU1[Gestionar Clases]
    CU2[Registro de Asistencia]
    CU3[Evaluaciones]
    CU4[Gestionar Coreografías]
    CU5[Gestionar Vestuarios]
    
    Profesora --> CU1
    Profesora --> CU2
    Profesora --> CU3
    Profesora --> CU4
    Profesora --> CU5
    
    CU1 --> CU1_1[Ver Clases Asignadas]
    CU1 --> CU1_2[Ver Detalles de Clase]
    CU1 --> CU1_3[Ver Alumnas Inscritas]
    CU1 --> CU1_4[Subir Material de Apoyo]
    CU1 --> CU1_5[Gestionar Videos y Música]
    
    CU2 --> CU2_1[Registrar Asistencia]
    CU2 --> CU2_2[Ver Historial de Asistencia]
    CU2 --> CU2_3[Agregar Observaciones Detalladas]
    CU2 --> CU2_4[Filtrar por Fecha y Clase]
    
    CU3 --> CU3_1[Crear Evaluación]
    CU3 --> CU3_2[Asignar Nota]
    CU3 --> CU3_3[Agregar Comentarios]
    CU3 --> CU3_4[Ver Progreso de Alumnas]
    CU3 --> CU3_5[Ver Historial de Evaluaciones]
    
    CU4 --> CU4_1[Crear Coreografía]
    CU4 --> CU4_2[Ver Lista de Coreografías]
    CU4 --> CU4_3[Asignar a Clase]
    CU4 --> CU4_4[Ver Detalles de Coreografía]
    CU4 --> CU4_5[Subir Videos y Música]
    CU4 --> CU4_6[Gestionar Participantes]
    
    CU5 --> CU5_1[Crear Diseño de Vestuario]
    CU5 --> CU5_2[Ver Lista de Vestuarios]
    CU5 --> CU5_3[Asignar a Coreografía]
    CU5 --> CU5_4[Ver Detalles de Vestuario]
    CU5 --> CU5_5[Gestionar Estados]
```

#### Casos de Uso de la Alumna

```mermaid
graph TD
    Alumna[Alumna]
    CU1[Registrarse en el Sistema]
    CU2[Iniciar Sesión]
    CU3[Recuperar Contraseña]
    CU4[Inscribirse a Clases]
    CU5[Ver Mis Inscripciones]
    CU6[Subir Documentos]
    CU7[Ver Estado de Documentos]
    CU8[Planilla de Inscripción]
    
    Alumna --> CU1
    Alumna --> CU2
    Alumna --> CU3
    Alumna --> CU4
    Alumna --> CU5
    Alumna --> CU6
    Alumna --> CU7
    Alumna --> CU8
    
    CU1 --> CU1_1[Completar Formulario de Registro]
    CU1 --> CU1_2[Ingresar Datos Personales]
    CU1 --> CU1_3[Crear Cuenta]
    
    CU2 --> CU2_1[Ingresar Email y Contraseña]
    CU2 --> CU2_2[Acceder al Dashboard]
    
    CU3 --> CU3_1[Solicitar Recuperación]
    CU3 --> CU2[Recibir Email con Token]
    CU3 --> CU3_3[Restablecer Contraseña]
    
    CU4 --> CU4_1[Ver Clases Disponibles]
    CU4 --> CU4_2[Seleccionar Clase]
    CU4 --> CU4_3[Solicitar Inscripción]
    CU4 --> CU4_4[Ver Estado de Solicitud]
    
    CU5 --> CU5_1[Ver Lista de Inscripciones]
    CU5 --> CU5_2[Ver Estado Pendiente]
    CU5 --> CU5_3[Ver Estado Aprobado]
    CU5 --> CU5_4[Ver Estado Rechazado]
    CU5 --> CU5_5[Ver Notas de Revisión]
    CU5 --> CU5_6[Ver Clasificación Académica]
    
    CU6 --> CU6_1[Seleccionar Documento]
    CU6 --> CU6_2[Subir Archivo PDF]
    CU6 --> CU6_3[Confirmar Envío]
    
    CU7 --> CU7_1[Ver Documentos Enviados]
    CU7 --> CU7_2[Ver Estado Pendiente]
    CU7 --> CU7_3[Ver Estado Aprobado]
    CU7 --> CU7_4[Ver Estado Rechazado]
    
    CU8 --> CU8_1[Ver Planilla de Inscripción]
    CU8 --> CU8_2[Descargar PDF]
    CU8 --> CU8_3[Imprimir Planilla]
```

## Diagramas de Flujo (Lógica Principal)

### Flujo de Registro y Autenticación

```mermaid
flowchart TD
  A[Inicio] --> B[Usuario abre /register]
  B --> C[Completa formulario de registro con datos personales]
  C --> D[Backend valida datos y verifica email/cédula únicos]
  D -->|OK| E[Crear usuario en DB con rol ALUMNA]
  D -->|Error| B
  E --> F[Redirigir a /login]
  F --> G[Usuario ingresa credenciales]
  G --> H[NextAuth valida y crea sesión]
  H --> I[Redirigir a dashboard según rol]
```

### Flujo de Inscripción a Clases

```mermaid
flowchart TD
  A[Alumna autenticada] --> B[Abre /student/enroll]
  B --> C[Ve lista de clases disponibles]
  C --> D[Selecciona clase y solicita inscripción]
  D --> E[API /api/enrollments/submit crea inscripción]
  E --> F[Estado = PENDING]
  F --> G[Directora Académica o Admin abre /admin/enrollments]
  G --> H[Revisa inscripción]
  H --> I{Aprueba o rechaza?}
  I -->|Aprueba| J[API PATCH /api/enrollments/:id status=APPROVED]
  I -->|Rechaza| K[API PATCH /api/enrollments/:id status=REJECTED]
  J --> L[Alumna ve estado Aprobado en /student/enrollments]
  K --> M[Alumna ve estado Rechazado y nota]
```

### Flujo de Gestión de Usuarios por Administrador

```mermaid
flowchart TD
  A[Admin autenticado] --> B[Abre /admin/users]
  B --> C[Ve lista de usuarios del sistema]
  C --> D[Hace clic en Registrar Usuario]
  D --> E[Abre diálogo con formulario completo]
  E --> F[Completa datos y selecciona rol]
  F --> G[API POST /api/users crea usuario]
  G --> H{Usuario creado exitosamente?}
  H -->|Sí| I[Tabla se actualiza automáticamente]
  H -->|No| J[Muestra error en el formulario]
  I --> K[Admin puede registrar otro usuario]
```

### Flujo de Generación de Reportes

```mermaid
flowchart TD
  A[Admin o Directora en /admin/reports] --> B[Front hace fetch a /api/reports/summary]
  B --> C[Backend calcula métricas con Prisma]
  C --> D[Se muestran tarjetas y tabla de recientes]
  A --> E[Usuario pulsa Exportar CSV]
  E --> F[GET /api/reports/enrollments]
  F --> G[Backend genera reporte_inscripciones.csv]
  G --> H[Descarga del archivo CSV]
```

## Cómo correr el proyecto con Docker

Requisitos:

- Docker y Docker Compose instalados.

### 1. Variables de entorno

Las variables mínimas para correr en Docker ya están definidas en `docker-compose.yml`:

- `DATABASE_URL=postgresql://postgres:postgres@db:5432/student_docs`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=change_this_secret` (cámbialo)
- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=adminpass`

Si quieres personalizarlas, puedes editar el servicio `web` en `docker-compose.yml` o crear un `.env` y referenciarlo.

### 2. Construir y levantar los contenedores

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Esto hace lo siguiente:

1. Levanta un contenedor **db** con **Postgres 15** y crea la base `student_docs`.
2. Construye la imagen **web**:
   - Instala dependencias (`yarn install`).
   - Ejecuta `prisma generate`.
   - Ejecuta `yarn build`.
3. Al arrancar el contenedor **web**, el script `scripts/entrypoint.sh`:
   - Espera a que Postgres esté listo.
   - Ejecuta `npx prisma db push` para aplicar el schema.
   - Ejecuta `node scripts/seed-admin.js` para crear el usuario admin si no existe.
   - Arranca la app con `yarn start`.

Una vez todo está arriba, la aplicación queda disponible en:

- http://localhost:3000

### 3. Credenciales por defecto del admin

Tomadas de `docker-compose.yml`:

- **Email**: `admin@example.com`
- **Password**: `adminpass`

Puedes cambiarlos editando las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` y reconstruyendo la imagen (`docker compose up --build`).

### 4. Volúmenes y archivos subidos

En `docker-compose.yml` se define el volumen `uploads`, montado en `/usr/src/app/uploads` dentro del contenedor web.

- Los PDFs que suben los estudiantes se guardan en esa carpeta.
- El volumen persiste aunque reinicies el contenedor.

Para limpiar **solo** los datos (base y archivos) puedes hacer, con cuidado:

```bash
docker compose down -v
```

Esto detiene los contenedores y borra los volúmenes `db-data` y `uploads`.

## Cómo correr en modo desarrollo (sin Docker para la app)

También puedes correr `next dev` en tu máquina y usar Postgres en Docker o local.

Requisitos:

- Node.js 20 (como en la imagen Docker).
- Yarn (o npm/pnpm si adaptas los comandos).

### 1. Instalar dependencias

```bash
yarn install
```

### 2. Levantar solo la base de datos con Docker

Puedes reutilizar el servicio `db` del `docker-compose` y levantar únicamente la base:

```bash
docker compose up db
```

Esto expone Postgres en `localhost:5432` con:

- usuario: `postgres`
- password: `postgres`
- base: `student_docs`

### 3. Configurar `.env`

Copia el ejemplo (si existe) o crea `DATABASE_URL` manualmente:

```bash
cp .env.sample .env  # si el archivo existe
```

Dentro de `.env` asegúrate de tener algo como:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_docs
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change_this_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpass
```

### 4. Ejecutar Prisma (schema y cliente)

Desde la raíz:

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed del usuario administrador

```bash
node scripts/seed-admin.js
```

### 6. Levantar la app en dev

```bash
yarn dev
```

La app quedará disponible en http://localhost:3000.

## Estructura del Proyecto

Las rutas usan el **App Router** de Next.js (`app/`). Estructura principal:

### Directorio `app/`

- `page.tsx`: página de inicio (landing) con CTA para login/registro
- `layout.tsx`: layout principal de la aplicación
- `login/page.tsx`: formulario de inicio de sesión
- `register/page.tsx`: alta de alumna con datos personales completos
- `dashboard/page.tsx`: dashboard simple post-login según rol

#### Vistas por Rol

- `student/`
  - `enroll/page.tsx`: formulario para inscribirse a clases
  - `enrollments/page.tsx`: tabla con inscripciones de la alumna

- `profesora/`
  - `classes/page.tsx`: gestión de clases asignadas
  - `choreographies/page.tsx`: gestión de coreografías
  - `costumes/page.tsx`: gestión de vestuarios

- `directora/`
  - `events/page.tsx`: gestión de eventos académicos
  - `attendance/page.tsx`: control de asistencias

- `admin/`
  - `users/page.tsx`: lista y registro de usuarios (solo admin)
  - `enrollments/page.tsx`: revisión de inscripciones (admin y directora)
  - `documents/page.tsx`: gestión de documentos (solo admin)
  - `payments/page.tsx`: control de pagos (solo admin)
  - `reports/page.tsx`: tablero de reportes + export CSV (admin y directora)

### Directorio `app/api/`

- `auth/[...nextauth]/route.ts`: configuración de NextAuth
- `auth/register/route.ts`: registro de alumna (POST)
- `classes/route.ts`: gestión de clases (GET, POST)
- `enrollments/`
  - `submit/route.ts`: solicitud de inscripción (POST)
  - `my/route.ts`: inscripciones del usuario autenticado (GET)
  - `all/route.ts`: todas las inscripciones (admin/directora) (GET)
  - `[id]/route.ts`: actualización de estado de inscripción (PATCH)
- `reports/`
  - `summary/route.ts`: estadísticas para el dashboard de reportes
  - `enrollments/route.ts`: export a CSV de inscripciones
- `users/route.ts`: listado y creación de usuarios (solo admin) (GET, POST)

### Directorio `src/components/`

- `atoms/BackButton.tsx`: componentes básicos
- `molecules/Sidebar.tsx`: sidebar principal con navegación según rol
- `organisms/Layout.tsx`: layout general con tema MUI + sidebar
- `admin/`
  - `AdminUsersTable.tsx`: tabla de usuarios con formulario de registro
  - `AdminReportsDashboard.tsx`: dashboard de reportes
  - `ReviewEnrollmentsTable.tsx`: tabla de revisión de inscripciones
  - `RecentEnrollmentsTable.tsx`: tabla de inscripciones recientes

### Directorio `src/lib/`

- `auth.ts`: configuración de NextAuth (credentials, callbacks, etc.)
- `prisma.ts`: cliente Prisma

### Directorio `src/utils/`

- `roles.ts`: definición de tipos y etiquetas de roles
- `status.ts`: definición de tipos y etiquetas de estados

### Directorio `prisma/`

- `schema.prisma`: definición de modelos (User, Class, Schedule, Enrollment)

### Directorio `scripts/`

- `entrypoint.sh`: script de arranque en Docker (espera DB, aplica schema, seed y arranca Next.js)
- `seed-admin.js`: script de seed que crea usuarios base (admin, directora, profesoras)
- `check-users.js`: script auxiliar para verificar usuarios en la base de datos
- `cleanup-old-users.js`: script auxiliar para limpiar usuarios antiguos

## Problemas comunes (troubleshooting rápido)

- **La web no abre en http://localhost:3000**

  - Revisa que el contenedor `web` esté arriba:
    - `docker compose ps`
  - Mira logs:
    - `docker compose logs web`

- **La base de datos no arranca o se cae**

  - Revisa logs de `db`:
    - `docker compose logs db`
  - Si quieres empezar de cero (borrar datos):
    - `docker compose down -v`

- **No recuerdo la contraseña del admin**

  - Cambia `ADMIN_PASSWORD` en `docker-compose.yml` o `.env`.
  - Vuelve a construir la imagen:
    - `docker compose up --build`

- **Error de conexión a Postgres en modo dev**
  - Verifica que `DATABASE_URL` en `.env` apunta a la base correcta.
  - Asegúrate de que `docker compose up db` esté corriendo o que tu Postgres local acepte conexiones.
