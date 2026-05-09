# Bellydance Project - Gestión de Academia de Baile

Aplicación en **Next.js 14 (App Router)** + **TypeScript** para gestionar **inscripciones y clases** en la academia de baile Bellydance Project, lista para correr con **Docker + PostgreSQL**.

## Qué hace la aplicación

### Roles

- **Estudiante**
  - Se registra con email y contraseña.
  - Inicia sesión.
  - Ve clases disponibles y se inscribe desde la página **Inscribirse**.
  - Ve el estado de sus inscripciones en la página **Mis Inscripciones**:
    - Pendiente / Aprobada / Rechazada.
    - Nota de revisión (observaciones del coordinador).
    - Fecha de última revisión.

- **Instructor**
  - Gestiona sus clases asignadas.
  - Ve estudiantes inscritos en sus clases.

- **Coordinador**
  - Revisa y aprueba inscripciones de estudiantes.
  - Gestiona clases y horarios.
  - Accede a reportes de inscripciones.

- **Administrador** (usuario creado automáticamente al levantar con Docker)
  - Control total del sistema.
  - Gestiona usuarios, clases y reportes.

### Flujo general

1. Un admin ya existe al levantar el sistema (seed).
2. Estudiantes se registran en `/register` y luego hacen login en `/login`.
3. El estudiante ve clases disponibles y se inscribe desde `/student/submit`.
4. El coordinador revisa en `/admin/review`, cambia el estado y escribe notas.
5. El estudiante ve los cambios en `/student/recepcion`.
6. El admin/coordinador puede consultar estadísticas desde `/admin/reports`.

## Vistas

Esta sección describe cómo se ve la aplicación.

- **Pantalla de login**
  - Formulario con campos de email y contraseña.
  - Botón para iniciar sesión y enlace para registrarse.

- **Dashboard de estudiante**
  - Sidebar a la izquierda con enlaces a "Inscribirse" y "Mis Inscripciones".
  - En la zona central, tarjetas con resumen (por ejemplo: clases inscritas, pendientes, aprobadas).

- **Entrega de documento**

  - Formulario con selector de archivo (PDF)

- **Recepción de documentos (estudiante)**

  - Tabla con columnas: Documento, Estado, Nota, Fecha de revisión.
  - Chips de colores para cada estado.

- **Panel de revisión (admin)**

  - Tabla con todos los documentos entregados.
  - Filtros por alumno, fecha y estado.
  - Botones para aprobar/rechazar y campo para escribir una nota de revisión.

- **Dashboard de reportes (admin)**
  - Tarjetas con métricas (usuarios, admins, estudiantes, documentos, pendientes, aprobados, rechazados).
  - Tabla de últimos documentos y botón "Exportar CSV".

## Tecnologías principales

- **Next.js 14 (App Router) + React 18 + TypeScript**.
- **NextAuth** con **Credentials provider** para login por email/contraseña.
- **PostgreSQL** vía `pg` y **Prisma ORM**.
- **Dockerfile** y **docker-compose** para levantar **db + web**.
- Seed script que crea un usuario administrador (credenciales via variables de entorno).
- Estructura de componentes siguiendo **Atomic Design**:
  - `atoms` → componentes muy pequeños (botones, inputs, etc.).
  - `molecules` → combinaciones simples de átomos.
  - `organisms` → bloques más grandes de UI (layouts, secciones de página).

## Diagramas de flujo (lógica principal)

### Flujo de registro y autenticación

```mermaid
flowchart TD
  A[Inicio] --> B[Usuario abre /register]
  B --> C[Completa formulario de registro]
  C --> D[Backend valida datos]
  D -->|OK| E[Crear usuario en DB]
  D -->|Error| B
  E --> F[Redirigir a /login]
  F --> G[Usuario ingresa credenciales]
  G --> H[NextAuth valida y crea sesión]
  H --> I[Redirigir a dashboard]
```

### Flujo de entrega y revisión de documentos

```mermaid
flowchart TD
  A[Estudiante autenticado] --> B[Abre /student/submit]
  B --> C[Sube PDF y envía formulario]
  C --> D[API /api/documents/submit guarda archivo y registro]
  D --> E[Estado = PENDING]
  E --> F[Admin autenticado abre /admin/review]
  F --> G[Admin revisa documento]
  G --> H{Aprueba o rechaza?}
  H -->|Aprueba| I[API PATCH /api/documents/:id status=RECEIVED]
  H -->|Rechaza| J[API PATCH /api/documents/:id status=REJECTED]
  I --> K[Estudiante ve estado Aprobado en /student/recepcion]
  J --> L[Estudiante ve estado Rechazado y nota]
```

### Flujo de generación de reportes

```mermaid
flowchart TD
  A[Admin en /admin/reports] --> B[Front hace fetch a /api/reports/summary]
  B --> C[Backend calcula métricas con Prisma]
  C --> D[Se muestran tarjetas y tabla de recientes]
  A --> E[Admin pulsa Exportar CSV]
  E --> F[GET /api/reports/documents]
  F --> G[Backend genera reporte_documentos.csv]
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

## Estructura del proyecto (resumen)

Las rutas usan el **App Router** de Next.js (`app/`). Algunas carpetas clave:

- `app/`

  - `page.tsx`: página de inicio (landing) con CTA para login/registro.
  - `login/page.tsx`: formulario de inicio de sesión.
  - `register/page.tsx`: alta de estudiante.
  - `dashboard/page.tsx`: dashboard simple post-login.
  - `student/submit/page.tsx`: formulario para subir PDFs.
  - `student/recepcion/page.tsx`: tabla con documentos del estudiante.
  - `admin/users/page.tsx`: lista de usuarios (solo admin).
  - `admin/review/page.tsx`: revisión de documentos (solo admin).
  - `admin/reports/page.tsx`: tablero de reportes + export CSV (solo admin).

- `app/api/`

  - `auth/[...nextauth]/route.ts`: configuración de NextAuth.
  - `auth/register/route.ts`: registro de usuario (POST).
  - `documents/submit/route.ts`: subida de PDFs (POST).
  - `documents/my/route.ts`: documentos del estudiante autenticado (GET).
  - `documents/all/route.ts`: documentos para el admin (GET).
  - `documents/[id]/route.ts`: actualización de estado del documento (PATCH).
  - `documents/[id]/file/route.ts`: descarga/visualización del PDF.
  - `reports/summary/route.ts`: estadísticas para el dashboard de reportes.
  - `reports/documents/route.ts`: export a CSV `reporte_documentos.csv`.
  - `users/route.ts`: listado de usuarios (solo admin).

- `src/components/`

  - `atoms/BackButton.tsx`, etc.: componentes básicos.
  - `molecules/Sidebar.tsx`: sidebar principal con navegación según rol.
  - `organisms/Layout.tsx`: layout general con tema MUI + sidebar.
  - `admin/ReviewDocumentsTable.tsx`, `AdminReportsDashboard.tsx`, `AdminUsersTable.tsx`, `RecentDocumentsTable.tsx`: componentes específicos para la sección admin.

- `src/lib/`

  - `auth.ts`: configuración de NextAuth (credentials, callbacks, etc.).
  - `prisma.ts`: cliente Prisma.

- `prisma/schema.prisma`: definición de modelos `User` y `Document`.

- `scripts/entrypoint.sh`: script de arranque en Docker (espera DB, aplica schema, seed y arranca Next.js).

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
