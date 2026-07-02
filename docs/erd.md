# Diagrama Entidad-Relación (ERD) del Sistema

## Descripción General

El Diagrama Entidad-Relación (ERD) muestra la estructura de la base de datos del sistema Bellydance Project, representando las tablas, sus columnas, tipos de datos, restricciones y relaciones. Este diagrama está basado directamente en el esquema de Prisma.

## Diagrama ERD (Mermaid)

```mermaid
erDiagram
    User ||--o{ Enrollment : "student"
    User ||--o{ Enrollment : "reviewer"
    User ||--o{ Class : "instructor"
    User ||--o{ Attendance : "student"
    User ||--o{ Evaluation : "student"
    User ||--o{ Payment : "student"
    User ||--o{ Costume : "instructor"
    User ||--o{ Choreography : "instructor"
    User ||--o{ ChoreographyParticipant : "student"
    User ||--o{ Document : "student"
    User ||--o{ Document : "registeredBy"
    User ||--o{ ClassSchedule : "instructor"

    Class ||--o{ Schedule : "class"
    Class ||--o{ Enrollment : "class"
    Class ||--o{ Attendance : "class"
    Class ||--o{ Evaluation : "class"

    Choreography ||--o{ Costume : "choreography"
    Choreography ||--o{ ChoreographyParticipant : "choreography"

    Costume ||--|| Choreography : "choreography"
    Costume ||--|| User : "instructor"

    ChoreographyParticipant ||--|| Choreography : "choreography"
    ChoreographyParticipant ||--|| User : "student"

    Document ||--|| User : "student"
    Document ||--|| User : "registeredBy"

    Payment ||--|| PaymentReceipt : "receipt"
    Payment ||--|| User : "student"

    PaymentReceipt ||--|| Payment : "payment"

    ClassSchedule ||--|| User : "instructor"

    User {
        String id PK
        String email UK
        String password
        String role
        String nombre
        String apellido
        String cedula UK
        DateTime fechaNacimiento
        Int edad
        String direccion
        String fotoPerfil
        String resetToken
        DateTime resetTokenExpires
        DateTime createdAt
    }

    Class {
        String id PK
        String name
        String description
        String instructorId FK
        String supportMaterial
        String warmupExercises
        String danceRoutineDescription
        String danceTechniqueDescription
        String technique
        String topic
        String observations
        DateTime createdAt
    }

    Schedule {
        String id PK
        String classId FK
        String dayOfWeek
        String startTime
        String endTime
        String location
        DateTime createdAt
    }

    Enrollment {
        String id PK
        String studentId FK
        String classId FK
        DateTime enrollmentDate
        String status
        String academicLevel
        String ageCategory
        String reviewNote
        DateTime reviewedAt
        String reviewerId FK
        DateTime createdAt
    }

    Attendance {
        String id PK
        String studentId FK
        String classId FK
        DateTime date
        Boolean present
        String note
        String observations
        DateTime createdAt
    }

    Evaluation {
        String id PK
        String studentId FK
        String classId FK
        DateTime date
        Float score
        String comments
        String progress
        DateTime createdAt
    }

    Choreography {
        String id PK
        String name
        String description
        String level
        String music
        String videoUrl
        Int duration
        String status
        String instructorId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Costume {
        String id PK
        String name
        String description
        String color
        String imageUrl
        String accessories
        Float estimatedCost
        String status
        String instructorId FK
        String choreographyId FK
        DateTime createdAt
        DateTime updatedAt
    }

    ChoreographyParticipant {
        String id PK
        String choreographyId FK
        String studentId FK
        DateTime createdAt
    }

    Document {
        String id PK
        String studentId FK
        String type
        String description
        String fileUrl
        DateTime receivedDate
        DateTime deliveryDate
        String status
        String observations
        String registeredById FK
        String paymentId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Payment {
        String id PK
        String studentId FK
        DateTime paymentDate
        Float amount
        String paymentType
        String referenceNumber
        String bank
        String receiptId FK
        DateTime createdAt
    }

    PaymentReceipt {
        String id PK
        String receiptNumber UK
        String paymentId FK
        DateTime issueDate
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    Event {
        String id PK
        String name
        String description
        DateTime eventDate
        String location
        DateTime createdAt
    }

    ClassSchedule {
        String id PK
        String category
        String month
        String day
        String time
        String classroom
        String instructorId FK
        String academicLevel
        DateTime createdAt
        DateTime updatedAt
    }
```

## Descripción de Tablas

### Tabla User (Usuarios)

Almacena la información de todos los usuarios del sistema.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| email | String | UK | Correo electrónico único |
| password | String | - | Contraseña hasheada (bcrypt) |
| role | String | - | Rol del usuario (ADMIN, DIRECTORA_ACADEMICA, PROFESORA, ALUMNA) |
| nombre | String | - | Nombre del usuario |
| apellido | String | - | Apellido del usuario |
| cedula | String | UK | Número de cédula único |
| fechaNacimiento | DateTime | - | Fecha de nacimiento |
| edad | Int | - | Edad del usuario |
| direccion | String | - | Dirección física |
| fotoPerfil | String | - | URL de la foto de perfil |
| resetToken | String | Nullable | Token para recuperación de contraseña |
| resetTokenExpires | DateTime | Nullable | Expiración del token |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Class (Clases)

Almacena la información de las clases de baile.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| name | String | - | Nombre de la clase |
| description | String | - | Descripción detallada |
| instructorId | String | FK | ID de la profesora (User) |
| supportMaterial | String | Nullable | Material de apoyo (JSON) |
| warmupExercises | String | Nullable | Ejercicios de precalentamiento |
| danceRoutineDescription | String | Nullable | Descripción de la rutina |
| danceTechniqueDescription | String | Nullable | Descripción de la técnica |
| technique | String | Nullable | Técnica (legacy) |
| topic | String | Nullable | Tema (legacy) |
| observations | String | Nullable | Observaciones (legacy) |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Schedule (Horarios)

Almacena los horarios específicos de las clases.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| classId | String | FK | ID de la clase (Class) |
| dayOfWeek | String | - | Día de la semana (MONDAY-SUNDAY) |
| startTime | String | - | Hora de inicio (HH:MM) |
| endTime | String | - | Hora de fin (HH:MM) |
| location | String | - | Ubicación |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Enrollment (Inscripciones)

Almacena las solicitudes de inscripción de alumnas a clases.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| studentId | String | FK | ID de la alumna (User) |
| classId | String | FK | ID de la clase (Class) |
| enrollmentDate | DateTime | - | Fecha de solicitud |
| status | String | - | Estado (PENDING, APPROVED, REJECTED) |
| academicLevel | String | Nullable | Nivel académico (BASICO, INTERMEDIO, AVANZADO) |
| ageCategory | String | Nullable | Categoría de edad |
| reviewNote | String | Nullable | Nota de revisión |
| reviewedAt | DateTime | Nullable | Fecha de revisión |
| reviewerId | String | FK, Nullable | ID del revisor (User) |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Attendance (Asistencia)

Almacena los registros de asistencia de alumnas.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| studentId | String | FK | ID de la alumna (User) |
| classId | String | FK | ID de la clase (Class) |
| date | DateTime | - | Fecha del registro |
| present | Boolean | - | Indica si estuvo presente |
| note | String | Nullable | Nota breve |
| observations | String | Nullable | Observaciones detalladas |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Evaluation (Evaluaciones)

Almacena las evaluaciones del progreso de alumnas.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| studentId | String | FK | ID de la alumna (User) |
| classId | String | FK | ID de la clase (Class) |
| date | DateTime | - | Fecha de evaluación |
| score | Float | Nullable | Nota (0-10) |
| comments | String | Nullable | Comentarios |
| progress | String | Nullable | Notas de progreso |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Choreography (Coreografías)

Almacena la información de las coreografías.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| name | String | - | Nombre de la coreografía |
| description | String | - | Descripción |
| level | String | - | Nivel de dificultad |
| music | String | Nullable | URL de la música |
| videoUrl | String | Nullable | URL del video |
| duration | Int | Nullable | Duración en minutos |
| status | String | - | Estado (PRACTICE, DEVELOPMENT, READY_FOR_PRESENTATION) |
| instructorId | String | FK | ID de la profesora (User) |
| createdAt | DateTime | - | Fecha de creación |
| updatedAt | DateTime | - | Fecha de actualización |

### Tabla Costume (Vestuarios)

Almacena la información de los vestuarios.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| name | String | - | Nombre del vestuario |
| description | String | - | Descripción |
| color | String | - | Color principal |
| imageUrl | String | Nullable | URL de la imagen |
| accessories | String | Nullable | Accesorios |
| estimatedCost | Float | Nullable | Costo estimado |
| status | String | - | Estado (DESIGN, APPROVED, REJECTED, IN_PRODUCTION, COMPLETED) |
| instructorId | String | FK | ID de la profesora (User) |
| choreographyId | String | FK | ID de la coreografía (Choreography) |
| createdAt | DateTime | - | Fecha de creación |
| updatedAt | DateTime | - | Fecha de actualización |

### Tabla ChoreographyParticipant (Participantes de Coreografía)

Almacena la relación muchos-a-muchos entre coreografías y alumnas.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| choreographyId | String | FK | ID de la coreografía (Choreography) |
| studentId | String | FK | ID de la alumna (User) |
| createdAt | DateTime | - | Fecha de creación |

### Tabla Document (Documentos)

Almacena la información de los documentos requeridos.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| studentId | String | FK | ID de la alumna (User) |
| type | String | - | Tipo de documento |
| description | String | - | Descripción |
| fileUrl | String | Nullable | URL del archivo |
| receivedDate | DateTime | Nullable | Fecha de recepción |
| deliveryDate | DateTime | Nullable | Fecha de entrega |
| status | String | - | Estado (RECIBIDO, EN_REVISION, APROBADO, RECHAZADO, ENTREGADO) |
| observations | String | Nullable | Observaciones |
| registeredById | String | FK, Nullable | ID del registrador (User) |
| paymentId | String | FK, Nullable | ID del pago asociado (Payment) |
| createdAt | DateTime | - | Fecha de creación |
| updatedAt | DateTime | - | Fecha de actualización |

### Tabla Payment (Pagos)

Almacena la información de los pagos.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| studentId | String | FK | ID de la alumna (User) |
| paymentDate | DateTime | - | Fecha de pago |
| amount | Float | - | Monto |
| paymentType | String | - | Tipo (EFECTIVO, PAGO_MOVIL, TRANSFERENCIA) |
| referenceNumber | String | Nullable | Número de referencia |
| bank | String | Nullable | Banco |
| receiptId | String | FK, Nullable | ID del recibo (PaymentReceipt) |
| createdAt | DateTime | - | Fecha de creación |

### Tabla PaymentReceipt (Recibos de Pago)

Almacena la información de los recibos de pago.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| receiptNumber | String | UK | Número de recibo único |
| paymentId | String | FK | ID del pago (Payment) |
| issueDate | DateTime | - | Fecha de emisión |
| status | String | - | Estado (PAGADO) |
| createdAt | DateTime | - | Fecha de creación |
| updatedAt | DateTime | - | Fecha de actualización |

### Tabla Event (Eventos)

Almacena la información de los eventos académicos.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| name | String | - | Nombre del evento |
| description | String | - | Descripción |
| eventDate | DateTime | - | Fecha del evento |
| location | String | - | Ubicación |
| createdAt | DateTime | - | Fecha de creación |

### Tabla ClassSchedule (Horarios de Clases)

Almacena los horarios de clases por categoría y nivel.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|----------------|-------------|
| id | String | PK, CUID | Identificador único |
| category | String | - | Categoría de edad |
| month | String | - | Mes (ENERO-DICIEMBRE) |
| day | String | - | Día de la semana (MONDAY-SUNDAY) |
| time | String | - | Hora (HH:MM) |
| classroom | String | - | Aula |
| instructorId | String | FK | ID de la profesora (User) |
| academicLevel | String | - | Nivel académico (BASICO, INTERMEDIO, AVANZADO) |
| createdAt | DateTime | - | Fecha de creación |
| updatedAt | DateTime | - | Fecha de actualización |

## Relaciones y Cardinalidades

### Relaciones Uno a Muchos (1:N)

| Tabla Padre | Tabla Hija | Campo FK | Descripción |
|-------------|-------------|-----------|-------------|
| User | Enrollment | studentId | Una alumna tiene múltiples inscripciones |
| User | Enrollment | reviewerId | Un usuario puede revisar múltiples inscripciones |
| User | Class | instructorId | Una profesora imparte múltiples clases |
| User | Attendance | studentId | Una alumna tiene múltiples registros de asistencia |
| User | Evaluation | studentId | Una alumna tiene múltiples evaluaciones |
| User | Payment | studentId | Una alumna tiene múltiples pagos |
| User | Costume | instructorId | Una profesora diseña múltiples vestuarios |
| User | Choreography | instructorId | Una profesora crea múltiples coreografías |
| User | ChoreographyParticipant | studentId | Una alumna participa en múltiples coreografías |
| User | Document | studentId | Una alumna tiene múltiples documentos |
| User | Document | registeredById | Un usuario puede registrar múltiples documentos |
| User | ClassSchedule | instructorId | Una profesora tiene múltiples horarios |
| Class | Schedule | classId | Una clase tiene múltiples horarios |
| Class | Enrollment | classId | Una clase tiene múltiples inscripciones |
| Class | Attendance | classId | Una clase tiene múltiples registros de asistencia |
| Class | Evaluation | classId | Una clase tiene múltiples evaluaciones |
| Choreography | Costume | choreographyId | Una coreografía tiene múltiples vestuarios |
| Choreography | ChoreographyParticipant | choreographyId | Una coreografía tiene múltiples participantes |

### Relaciones Muchos a Uno (N:1)

| Tabla Hija | Tabla Padre | Campo FK | Descripción |
|-------------|-------------|-----------|-------------|
| Enrollment | User | studentId | Una inscripción pertenece a una alumna |
| Enrollment | User | reviewerId | Una inscripción es revisada por un usuario |
| Enrollment | Class | classId | Una inscripción pertenece a una clase |
| Schedule | Class | classId | Un horario pertenece a una clase |
| Attendance | User | studentId | Un registro de asistencia pertenece a una alumna |
| Attendance | Class | classId | Un registro de asistencia pertenece a una clase |
| Evaluation | User | studentId | Una evaluación pertenece a una alumna |
| Evaluation | Class | classId | Una evaluación pertenece a una clase |
| Costume | User | instructorId | Un vestuario es diseñado por una profesora |
| Costume | Choreography | choreographyId | Un vestuario pertenece a una coreografía |
| ChoreographyParticipant | User | studentId | Una participación pertenece a una alumna |
| ChoreographyParticipant | Choreography | choreographyId | Una participación pertenece a una coreografía |
| Document | User | studentId | Un documento pertenece a una alumna |
| Document | User | registeredById | Un documento es registrado por un usuario |
| Payment | User | studentId | Un pago pertenece a una alumna |
| PaymentReceipt | Payment | paymentId | Un recibo pertenece a un pago |
| ClassSchedule | User | instructorId | Un horario es asignado a una profesora |

### Relaciones Uno a Uno (1:1)

| Tabla A | Tabla B | Campo FK | Descripción |
|---------|---------|----------|-------------|
| Payment | PaymentReceipt | receiptId | Un pago tiene un recibo |

## Restricciones de Integridad

### Restricciones de Unicidad (Unique Constraints)

- `User.email`: El email debe ser único en el sistema
- `User.cedula`: La cédula debe ser única en el sistema
- `PaymentReceipt.receiptNumber`: El número de recibo debe ser único

### Restricciones de Clave Foránea (Foreign Keys)

Todas las relaciones están definidas mediante claves foráneas que aseguran la integridad referencial.

### Restricciones de No Nulidad (Not Null)

Los campos marcados como PK (Primary Key) no pueden ser nulos.
Los campos FK (Foreign Key) pueden ser nulos cuando la relación es opcional.

## Índices

Prisma crea automáticamente índices para:
- Todas las claves primarias (PK)
- Todas las claves foráneas (FK)
- Todos los campos con restricción de unicidad (UK)

## Normalización

El esquema está normalizado hasta la tercera forma normal (3NF):

1. **Primera Forma Normal (1NF)**: Todos los campos son atómicos
2. **Segunda Forma Normal (2NF)**: Todos los campos no clave dependen completamente de la clave primaria
3. **Tercera Forma Normal (3NF)**: No hay dependencias transitivas

## Consideraciones de Diseño

### Tipos de Datos

- **String**: Usado para IDs, nombres, descripciones, URLs
- **DateTime**: Usado para fechas y timestamps
- **Int**: Usado para valores numéricos enteros (edad, duración)
- **Float**: Usado para valores decimales (monto, score)
- **Boolean**: Usado para valores verdadero/falso (present)

### Campos Nullable

Los campos nullable permiten relaciones opcionales:
- `resetToken`, `resetTokenExpires`: Solo se usan durante recuperación de contraseña
- `reviewerId`, `reviewedAt`: Solo se llenan cuando la inscripción ha sido revisada
- `academicLevel`, `ageCategory`: Solo se llenan cuando la inscripción es aprobada
- `supportMaterial`, `warmupExercises`, etc.: Campos opcionales de clases
- `music`, `videoUrl`, `duration`: Campos opcionales de coreografías
- `imageUrl`, `accessories`, `estimatedCost`: Campos opcionales de vestuarios
- `fileUrl`, `receivedDate`, `deliveryDate`: Campos opcionales de documentos
- `referenceNumber`, `bank`: Campos opcionales de pagos (no requeridos para efectivo)
- `receiptId`: Nullable porque el recibo se crea después del pago

### Timestamps

- **createdAt**: Presente en todas las tablas para rastrear cuándo se creó el registro
- **updatedAt**: Presente en tablas que se modifican frecuentemente (Choreography, Costume, Document, PaymentReceipt, ClassSchedule)

### IDs

Todos los IDs usan el tipo CUID de Prisma:
- CUID = Collision-resistant Unique Identifier
- Genera IDs únicos y seguros sin necesidad de secuencias
- Más corto que UUID y más seguro que auto-increment

## Optimizaciones de Consulta

### Consultas Frecuentes

1. **Buscar usuario por email**: Índice en `User.email`
2. **Buscar usuario por cédula**: Índice en `User.cedula`
3. **Inscripciones por alumna**: Índice en `Enrollment.studentId`
4. **Inscripciones por clase**: Índice en `Enrollment.classId`
5. **Inscripciones por estado**: Filtro frecuente, podría beneficiarse de índice compuesto
6. **Asistencia por alumna y clase**: Índices en `Enrollment.studentId` y `Enrollment.classId`
7. **Horarios por profesora**: Índice en `ClassSchedule.instructorId`

### Índices Compuestos Sugeridos

Para optimizar consultas complejas, se podrían agregar:

- `Enrollment(studentId, status)`: Para inscripciones de una alumna por estado
- `Enrollment(classId, status)`: Para inscripciones de una clase por estado
- `Attendance(studentId, date)`: Para historial de asistencia por fecha
- `Payment(studentId, paymentDate)`: Para historial de pagos por fecha

## Seguridad de Datos

### Contraseñas

- Las contraseñas se almacenan hasheadas usando bcrypt
- Nunca se almacenan en texto plano
- El campo `password` contiene el hash, no la contraseña original

### Tokens de Recuperación

- Los tokens de recuperación se generan aleatoriamente
- Tienen una expiración de 1 hora
- Se invalidan después de ser usados

### URLs de Archivos

- Las URLs de archivos (imágenes, videos, música) se almacenan como strings
- Los archivos físicos se almacenan en `public/uploads`
- Next.js configura `remotePatterns` para permitir el acceso

## Migraciones

El esquema se gestiona mediante Prisma Migrate:

```bash
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Sincronizar esquema (sin migración)
npx prisma db push
```

## Resumen del Esquema

| Tabla | Registros Estimados | Relaciones | Índices |
|-------|---------------------|------------|---------|
| User | 100+ | 10 relaciones | 3 (id, email, cedula) |
| Class | 20+ | 4 relaciones | 1 (id) |
| Schedule | 50+ | 1 relación | 1 (id) |
| Enrollment | 200+ | 3 relaciones | 1 (id) |
| Attendance | 1000+ | 2 relaciones | 1 (id) |
| Evaluation | 500+ | 2 relaciones | 1 (id) |
| Choreography | 30+ | 3 relaciones | 1 (id) |
| Costume | 50+ | 2 relaciones | 1 (id) |
| ChoreographyParticipant | 100+ | 2 relaciones | 1 (id) |
| Document | 300+ | 3 relaciones | 1 (id) |
| Payment | 400+ | 2 relaciones | 1 (id) |
| PaymentReceipt | 400+ | 1 relación | 2 (id, receiptNumber) |
| Event | 20+ | 0 relaciones | 1 (id) |
| ClassSchedule | 100+ | 1 relación | 1 (id) |

**Total de tablas**: 14
**Total de relaciones**: 35+
**Total de índices automáticos**: 50+
