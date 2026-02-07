# NestJS Students API - Learning Project

A progressive NestJS learning project building a Students REST API, evolving from in-memory storage to a full database-backed application.

---

# Day 01 - Students API (In-Memory)

Simple REST API built with NestJS to practice:
- Modules, Controllers, Services
- Dependency Injection (DI)
- DTOs + ValidationPipe (class-validator)
- Model binding (route params, query params, body)
- In-memory storage (no database)
- UUID id validation (ParseUUIDPipe)

> Note: Data is stored in memory, so it resets on server restart.

---

## Tech Stack (Day 01)
- NestJS
- TypeScript
- class-validator + class-transformer
- Node.js `crypto.randomUUID()` (UUID v4)

---

## Setup & Run (Day 01)

From this folder (`students-api/`):

```bash
npm install
npm run start:dev
```

Base URL:
- `http://localhost:3000/api`

---

## Endpoints (Day 01)

### 1) Get All Students
`GET /api/students/all`

### 2) Get Student By Id (UUID v4)
`GET /api/students/:id`

> `:id` must be a valid UUID v4, otherwise you get `400 Bad Request`.

### 3) Create Student
`POST /api/students`

Example body:
```json
{
  "name": "Ali",
  "age": 20,
  "grade": 75,
  "isActive": true
}
```

### 4) Update Student (Partial Update)
`PUT /api/students/:id`

Example body:
```json
{
  "age": 45
}
```

### 5) Delete Student
`DELETE /api/students/:id`

### 6) Get Passed Students
`GET /api/students/passed?minGrade=60`

- `minGrade` optional (default: 50)

### 7) Get Average Grade
`GET /api/students/averagegrade`

---

## Validation Rules (DTOs)
- `name`: string, min length 2
- `age`: integer between 6 and 80
- `grade`: integer between 0 and 100
- `isActive`: boolean

Validation is enabled globally using `ValidationPipe` in `src/main.ts`.

---

## Project Structure (Day 01)

```
src/
  main.ts                  # app bootstrap + global prefix + ValidationPipe
  app.module.ts            # imports StudentsModule
  students/
    students.module.ts     # module definition
    students.controller.ts # endpoints (routes)
    students.service.ts    # in-memory business logic
    dto/
      create-student.dto.ts
      update-student.dto.ts
    entities/
      student.entity.ts    # Student shape (id is UUID string)
    seed/
      students.seed.ts     # initial 10 students (seed data)
```

---

## Postman (Day 01)

Bu projedeki tüm endpoint'ler Postman Collection olarak hazırlanmıştır.

### Files
- Collection: `postman/Day01 - Students API.postman_collection.json`
- Environment: `postman/Local - Day01 Students API.postman_environment.json`

### Import & Run
1) Postman → **Import** → yukarıdaki collection dosyasını seç
2) (Opsiyonel) Environment dosyasını da import et ve **Local - Day01 Students API** environment'ını seç
3) Server'ı çalıştır:
   ```bash
   npm run start:dev
   ```
4) İstekleri çalıştır

---

## Notes (Day 01)
- This project uses in-memory array storage (`StudentsService`), no DB.
- Seed data is loaded on app start.
- UUID validation is implemented via `ParseUUIDPipe({ version: '4' })`.

---
---

# Day 02 - Students API (TypeORM + PostgreSQL)

REST API built with NestJS, TypeORM, and PostgreSQL:

- Modules, Controllers, Services
- DTOs + ValidationPipe (class-validator)
- TypeORM with PostgreSQL persistence
- UUID v4 validation (ParseUUIDPipe)
- Safe database seed (runs once, no duplicates)

---

## Tech Stack (Day 02)

- NestJS
- TypeScript
- TypeORM + PostgreSQL (pg)
- class-validator + class-transformer
- @nestjs/config (environment variables)

---

## 1) Install dependencies

From `students-api/`:

```bash
npm install
```

If you see peer dependency conflicts (e.g. with NestJS 11), use:

```bash
npm install --legacy-peer-deps
```

This installs (among others):

- `@nestjs/typeorm`, `typeorm`, `pg`
- `@nestjs/config`
- `dotenv`

---

## 2) PostgreSQL setup

- Install PostgreSQL and ensure it is running.
- Create the database:

```sql
CREATE DATABASE students_db;
```

(Or with `psql`: `psql -U postgres -c "CREATE DATABASE students_db;"`)

---

## 3) Environment

Copy `.env.example` to `.env` (or use the existing `.env`) and set:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `PORT` (optional, default 3000)

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=2004
DB_NAME=students_db
PORT=3000
```

---

## 4) Run migrations

Build and run the initial migration to create the `students` table:

```bash
npm run build
npm run migration:run
```

To generate a new migration after changing entities:

```bash
npm run migration:generate
```

Then run it:

```bash
npm run migration:run
```

---

## 5) Start the server

```bash
npm run start:dev
```

Base URL: `http://localhost:3000/api`

On first start, the seed runs once (if the table is empty) and inserts 10 students.

---

## Endpoints (Day 02)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/students` | All students |
| GET | `/api/students/all` | All students (same as above) |
| GET | `/api/students/:id` | Student by UUID v4 |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Partial update |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/passed?minGrade=60` | Students with grade ≥ minGrade (default 50) |
| GET | `/api/students/averagegrade` | `{ "average": number }` |

---

## Verification checklist (Day 02)

- [ ] `npm install` completes without errors.
- [ ] PostgreSQL is running and `students_db` exists.
- [ ] `.env` has correct DB credentials and PORT.
- [ ] `npm run build` succeeds.
- [ ] `npm run migration:run` runs and creates the `students` table.
- [ ] `npm run start:dev` starts and logs no DB connection errors.
- [ ] GET `/api/students` or GET `/api/students/all` returns an array (10 items after seed).
- [ ] GET `/api/students/3b1d8c6a-8c3a-4a3f-9b0c-7e3d2c5c8f11` returns one student.
- [ ] POST `/api/students` with valid body creates a student and returns it with `id` and `createdAt`.
- [ ] PUT `/api/students/:id` with partial body updates and returns the student.
- [ ] DELETE `/api/students/:id` returns `{ "deleted": true }`; GET same `:id` then returns 404.
- [ ] GET `/api/students/passed?minGrade=60` returns only students with grade ≥ 60.
- [ ] GET `/api/students/averagegrade` returns `{ "average": number }`.
- [ ] Invalid UUID in GET/PUT/DELETE `:id` returns 400.
- [ ] Non-existent `:id` returns 404.

---

## Postman (Day 02)

- Collection: `postman/Day01 - Students API.postman_collection.json`
- Environment: `postman/Local - Day01 Students API.postman_environment.json`

Use base URL `http://localhost:3000` (with prefix `/api` in the paths). Both `/api/students` and `/api/students/all` work for "Get All Students".

---

## Project structure (Day 02)

```
src/
  main.ts
  app.module.ts           # ConfigModule, TypeOrmModule.forRoot
  data-source.ts          # TypeORM DataSource for CLI migrations
  migrations/
    *.ts                  # TypeORM migrations
  students/
    students.module.ts    # TypeOrmModule.forFeature([StudentEntity])
    students.controller.ts
    students.service.ts   # Repository-based
    students-seed.service.ts  # Safe seed on bootstrap
    entities/
      student.entity.ts   # TypeORM entity
    dto/
      create-student.dto.ts
      update-student.dto.ts
    seed.ts               # Seed data (10 students)
```

---
---

# Day 03 - ConfigService, Repository Pattern & Request Trace ID

Refactors and features added:

- **ConfigService** – All app config now uses NestJS `ConfigService.get()` instead of `process.env.*` (TypeORM and `main.ts`).
- **Repository Pattern** – Student data access is behind an `IStudentRepository` interface; the service depends on the interface and Nest injects the TypeORM implementation via a token (testable, swappable).
- **Request Correlation ID (Trace ID)** – Every request gets a unique `traceId` (UUID), attached to `req.traceId` and sent back in the `X-Trace-Id` response header.
- **Trace-aware logging** – `TraceContextService` and `TraceLoggerService` let any controller/service access the current trace ID and log with it.

---

## Tech Stack (Day 03)

- Everything from Day 02, plus:
- `ConfigService` for all environment-based config (no direct `process.env` in app code).
- Request-scoped trace ID via middleware + `AsyncLocalStorage`.
- Express type augmentation for `req.traceId`.

---

## 1) Config: ConfigService

- **`src/app.module.ts`** – TypeORM uses `TypeOrmModule.forRootAsync()` with a factory that injects `ConfigService`. DB settings read via `configService.get('DB_HOST', 'localhost')`, etc.; `DB_PORT` is parsed with `parseInt(..., 10)`.
- **`src/main.ts`** – Port is read with `app.get(ConfigService)` and `configService.get('PORT', '3000')`, then parsed before `app.listen()`.
- **`src/data-source.ts`** – Still uses `process.env` and `dotenv/config` (TypeORM CLI runs outside Nest). Comment added to document this.

No new env vars; same keys: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `PORT`.

---

## 2) Repository Pattern

We use the **Repository Pattern** so the application layer (services) does not depend on a specific persistence implementation (e.g. TypeORM). The service talks to an **interface**, and Nest injects the concrete implementation via a **token**.

- **Interface** – `IStudentRepository` (`src/students/repositories/student.repository.interface.ts`) defines the contract: `create`, `save`, `find`, `findOneBy`, `merge`, `delete`, `count`, `findWithGradeGreaterOrEqual`, `getAverageGrade`. The service only knows this API.
- **Implementation** – `StudentRepository` (`src/students/repositories/student.repository.ts`) implements `IStudentRepository` and delegates to TypeORM’s `Repository<StudentEntity>`. All DB access lives here.
- **Token** – `STUDENT_REPOSITORY` is a `Symbol` used as the injection token. In `StudentsModule`, we register: `{ provide: STUDENT_REPOSITORY, useClass: StudentRepository }`. The service (and seed) inject with `@Inject(STUDENT_REPOSITORY) private readonly repository: IStudentRepository`.
- **Why** – The service stays free of TypeORM imports and SQL details. You can unit-test by providing a mock that implements `IStudentRepository`, or swap to another storage (e.g. MongoDB, in-memory) by adding a new implementation and changing the `useClass` (or `useFactory`) in the module.

**Summary:** Service → depends on `IStudentRepository` (interface) ← provided by `StudentRepository` (TypeORM). Data access is encapsulated behind the repository interface.

---

## 3) Request Trace ID (Middleware)

- **Middleware** – `TraceIdMiddleware` runs first on every request: generates `traceId` with `crypto.randomUUID()`, sets `req.traceId`, sets response header `X-Trace-Id`, and runs the rest of the pipeline inside `AsyncLocalStorage.run()` so the same ID is available for the whole request.
- **Applied globally** – In `AppModule`, `configure(consumer)` uses `consumer.apply(TraceIdMiddleware).forRoutes('*')` (module approach, no middleware in `main.ts`).
- **Typing** – `src/types/express.d.ts` augments `Express.Request` with optional `traceId?: string`.

---

## 4) Trace context and logging

- **`TraceContextService`** – Injectable; `getTraceId()` returns the current request’s trace ID (or `undefined` outside a request). Uses the same `AsyncLocalStorage` as the middleware.
- **`TraceLoggerService`** – Injectable logger that prefixes each message with `[traceId=...]` when a trace ID exists. Methods: `log`, `error`, `warn`, `debug`, `verbose`.
- **`CommonModule`** – Global module that provides and exports both services so they can be injected anywhere.
- **Example** – `StudentsService.findById()` injects `TraceLoggerService` and logs a warning with trace ID when a student is not found.

---

## 5) Project structure (Day 03 additions)

```
src/
  types/
    express.d.ts          # Augmentation: Request.traceId
  common/
    trace-context.ts      # AsyncLocalStorage<TraceStore>
    trace-context.service.ts
    trace-logger.service.ts
    common.module.ts      # Global; exports trace services
  middleware/
    trace-id.middleware.ts
  students/
    repositories/
      student.repository.interface.ts   # IStudentRepository + STUDENT_REPOSITORY token
      student.repository.ts             # StudentRepository (TypeORM implementation)
      index.ts
    students.module.ts    # provide: STUDENT_REPOSITORY, useClass: StudentRepository
    students.service.ts  # @Inject(STUDENT_REPOSITORY) repository: IStudentRepository
  app.module.ts          # NestModule + configure(TraceIdMiddleware.forRoutes('*'))
                          # Imports CommonModule; TypeOrmModule.forRootAsync(ConfigService)
  main.ts                # Port from ConfigService
```

---

## 6) Verification (Day 03)

- [ ] `npm run start:dev` runs; no config or middleware errors.
- [ ] Any request returns response header `X-Trace-Id` with a UUID (e.g. `GET /api/students`).
- [ ] Controllers can use `@Req() req` and read `req.traceId` (same UUID as header).
- [ ] Services can inject `TraceContextService` and call `getTraceId()`; inject `TraceLoggerService` and log; logs show `[traceId=...]` when in a request.
- [ ] DB and port still come from `.env` via ConfigService (no `process.env` in app code except `data-source.ts`).

---
---

# Day 04 – Prisma, Teachers & Courses, Pagination & Seed

Summary of changes and features added.

---

## 1) TypeORM → Prisma

- **Replaced TypeORM** with **Prisma 7**: `prisma/schema.prisma`, `prisma.config.ts`, `@prisma/adapter-pg`.
- **PrismaModule + PrismaService** (`src/prisma/`): global module; builds `DATABASE_URL` from env (see §2); connects/disconnects in lifecycle hooks.
- **Student data access**: `IStudentRepository` implemented by `StudentRepositoryPrisma`; students service and API behavior unchanged (same DTOs, routes, responses).
- **Migrations**: Prisma migrations in `prisma/migrations/`; `npm run migration:deploy` (or `migration:dev`). Scripts use `scripts/prisma-generate.js` and `scripts/migrate-deploy.js` so CLI works with `DB_*` vars.

---

## 2) Database configuration (single source of truth)

- **Option A:** `DATABASE_URL`  
- **Option B:** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` (all required if no `DATABASE_URL`).
- **Shared helper** – `src/config/database-url.ts`: `getDatabaseUrl(env)` returns URL or throws with a clear message. Empty `DATABASE_URL` is treated as “not set” (fallback to Option B).
- **Used in:** (1) `prisma.config.ts` for Prisma CLI (generate/migrate); (2) `PrismaService` at runtime (via ConfigService).
- **Joi** (in `env.validation.ts`) enforces “either DATABASE_URL or all DB_*” at app bootstrap so misconfiguration fails fast.

---

## 3) Student refactors (structure & DTOs)

- **StudentEntity → StudentModel**: plain type in `src/students/models/student.model.ts` (no ORM).
- **StudentResponseDto**: API response shape; `createdAt` as ISO string. Base student DTOs unchanged (no `courses` field).
- **Mapper**: `src/students/mappers/student.mapper.ts` – pure `toStudentResponseDto(model)`.
- **Course relations**: exposed only via `GET /api/students/:id/courses` returning `CourseResponseDto[]` (no change to `StudentResponseDto`).

---

## 4) Prisma schema: Teacher & Course

- **Teacher**: `id` (UUID), `fullName`, `email` (unique), `createdAt`.
- **Course**: `id` (UUID), `title`, `code` (unique), `createdAt`, `teacherId` (required), `teacher` relation with `onDelete: Cascade`.
- **Course ↔ Student**: implicit many-to-many (`courses` on Student, `students` on Course). Table `students` kept with `@@map("students")`.
- **Migration**: `add_teacher_and_course`; then seed data for teachers, courses, and student–course enrollments.

---

## 5) Seed data (idempotent, ordered)

- **Teachers** – `src/teachers/seed.ts` + `TeachersSeedService`: seeds 2 teachers only when table is empty.
- **Courses** – `src/courses/seed.ts` + `CoursesSeedService`: seeds 4 courses (linked to teachers) only when table is empty.
- **Students** – `StudentsSeedService` uses Prisma: seeds students if empty, then **enrollments** (connects some students to courses); skips gracefully if no students or no courses.
- **Order**: `AppSeedService` (OnApplicationBootstrap) runs `teachers.seed()` → `courses.seed()` → `students.seed()`. Seed services live in TeachersModule/CoursesModule/StudentsModule and are reused by AppSeedService (no duplicated logic).

---

## 6) Teachers & Courses feature modules

Same structure as students: **dto/, mappers/, models/, repositories/** (interface + Prisma impl), **module, controller, service**.

### Shared pagination

- **PaginationQueryDto** (`src/common/dto/pagination-query.dto.ts`): `page` (default 1), `limit` (default 20, max 100), `@Type(() => Number)` + ValidationPipe `transform: true`; `getSkip()` = `(page - 1) * limit`, `getTake()` = `limit`.
- List endpoints return **`{ data, meta }`** with `meta: { page, limit, total }` (or `meta: { total }` for single-resource lists like teacher’s courses).

### Teachers

- **Endpoints:** `GET /api/teachers` (list, paginated, optional `search` on fullName/email), `GET /api/teachers/:id/courses`, `GET /api/teachers/:id`, `POST`, `PATCH /:id`, `DELETE /:id`.
- **Repository:** findMany(skip, take, search), count, findOneBy, create, save, merge, delete.
- **404** when teacher not found; UUID params validated with ParseUUIDPipe.

### Courses

- **Endpoints:** `GET /api/courses` (list, paginated, optional `search` title/code, filter `teacherId`), `GET /api/courses/:id` (details: **CourseDetailsResponseDto** with teacher + studentsCount), `POST`, `PATCH /:id`, `DELETE /:id`, `POST /:id/students/:studentId` (enroll), `DELETE /:id/students/:studentId` (unenroll).
- **Enroll/unenroll**: idempotent (no 409 if already connected/disconnected); 404 if course or student not found.
- **CourseDetailsResponseDto**: used only for `GET /api/courses/:id`; base `CourseResponseDto` stays minimal.

### DTOs and updates

- **PATCH** (not PUT) for update on teachers and courses; DTOs are PartialType, behavior unchanged.
- Base response DTOs kept minimal; relations and details via dedicated DTOs/endpoints only.

---

## 7) Project structure (Day 04)

```
prisma/
  schema.prisma
  migrations/
prisma.config.ts
src/
  config/
    database-url.ts       # getDatabaseUrl(env)
    env.validation.ts     # Joi, Option A or B
  common/
    dto/
      pagination-query.dto.ts
  prisma/
    prisma.module.ts
    prisma.service.ts
  teachers/
    dto/, mappers/, models/, repositories/
    teachers.controller.ts
    teachers.service.ts
    teachers.module.ts
    teachers-seed.service.ts
    seed.ts
  courses/
    dto/, mappers/, models/, repositories/
    courses.controller.ts
    courses.service.ts
    courses.module.ts
    courses-seed.service.ts
    seed.ts
  students/
    dto/, mappers/, models/, repositories/
    students.controller.ts
    students.service.ts
    students-seed.service.ts
    students.module.ts
    seed.ts
  app-seed.service.ts      # Runs teachers → courses → students seed in order
  app.module.ts            # Imports StudentsModule, TeachersModule, CoursesModule
```

---

## 8) Run & verify (Day 04)

- **Env:** `DATABASE_URL` or `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`; `PORT` optional (default 3000).
- **Migrations:** `npm run migration:deploy` (or `npx prisma migrate dev` for dev).
- **Start:** `npm run start:dev` (base URL `http://localhost:3000/api`).
- **Build/tests:** `npm run build`, `npm test`.

---
---

# Day 05 – Authentication (JWT, Registration, Role-Based Access)

Summary of what was accomplished.

---

## 1) Authentication module

- **AuthModule** – JWT-based auth using `@nestjs/jwt` and `@nestjs/passport` with a custom JWT strategy. Access and refresh tokens; refresh tokens stored hashed in the database (`User.refreshTokenHash`).
- **Auth endpoints** – `POST /api/auth/register` (public), `POST /api/auth/login` (public), `POST /api/auth/refresh` (public), `POST /api/auth/logout` (protected), `GET /api/auth/me` (protected). Register and login return `{ user, tokens }` with `accessToken`, `refreshToken`, and `expiresIn`.
- **User model** – Prisma `User` with `email`, `passwordHash`, `role` (enum: `TEACHER` | `STUDENT`), `isActive`, and optional `refreshTokenHash`. One-to-one with `Teacher` or `Student` (created on registration by role).

---

## 2) Registration and roles

- **Registration** – Accepts `email`, `password`, and `role`. For `TEACHER`: requires `fullName`; creates a `Teacher` linked to the user. For `STUDENT`: requires `name`, `age`, `grade`; creates a `Student` linked to the user. Passwords hashed with bcrypt (rounds from `BCRYPT_ROUNDS`).
- **Role-based access** – `@Roles(Role.TEACHER)` (or `Role.STUDENT`) plus `RolesGuard` restrict routes by `user.role` from the JWT payload. Use with `JwtAuthGuard` (or rely on the global guard).

---

## 3) Global JWT guard and public routes

- **Global guard** – `JwtAuthGuard` is registered as `APP_GUARD` in `AppModule`, so all routes require a valid JWT by default.
- **Public routes** – `@Public()` decorator marks routes that skip the JWT guard (register, login, refresh). Implemented via reflector metadata; guard checks for it before validating the token.

---

## 4) Configuration and security

- **Env validation** (Joi) – `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (min 16 chars), `JWT_ACCESS_EXPIRES_IN` (default `15m`), `JWT_REFRESH_EXPIRES_IN` (default `7d`), `BCRYPT_ROUNDS` (10–20, default 10).
- **JWT payload** – Includes `sub` (userId), `email`, `role`, and optionally `teacherId` / `studentId` for use in guards and `@CurrentUser()`.

---

## 5) Project structure (Day 05 additions)

```
src/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    auth.types.ts
    dto/ (register, login, refresh-token)
    decorators/ (current-user, public, roles)
    guards/ (jwt-auth.guard, roles.guard)
    strategies/ (jwt.strategy.ts)
  users/
    users.module.ts
    users.service.ts
    ...
prisma/schema.prisma   # User model, Role enum, refreshTokenHash
```

---

## 6) Run & verify (Day 05)

- **Env:** Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (each ≥ 16 characters). Optional: `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `BCRYPT_ROUNDS`.
- **Migrations:** Ensure User table and any auth-related columns exist (`npm run migration:deploy`).
- **Endpoints:** Register → login → use `accessToken` in `Authorization: Bearer <token>` for `/api/auth/me` and other protected routes; use `refreshToken` at `POST /api/auth/refresh` to get new tokens; logout clears refresh token server-side.

---
---

# Day 06 – Exception Filters & Unified Error Responses

Summary of the exception filter implementation and unified error response shape.

---

## 1) Goals

- **Consistent error responses** – Every error (4xx and 5xx) returns the same JSON shape: `statusCode`, `message`, `error`, optional `traceId`, optional `details`.
- **Validation errors** – ValidationPipe (class-validator) errors are formatted with `message: "Validation failed"` and `details.errors` (field + messages).
- **Unknown errors** – Unhandled exceptions (e.g. raw `Error`, unexpected failures) are logged with trace ID and return a safe 500 response without exposing stack or internal messages in production.
- **Trace ID** – Error responses include `traceId` when the request passed through `TraceIdMiddleware`, so support can correlate with logs.

---

## 2) Standard error response shape

All error responses use this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "traceId": "uuid-when-available",
  "details": {
    "errors": [
      { "field": "body", "messages": ["email must be an email"] }
    ]
  }
}
```

- **statusCode** – HTTP status (number).
- **message** – Short, client-friendly message (string; for validation always `"Validation failed"`).
- **error** – HTTP status text (e.g. `"Bad Request"`, `"Not Found"`).
- **traceId** – Present when the request had a trace ID (from middleware).
- **details** – Optional. For validation: `{ errors: [ { field, messages } ] }`; omitted for other errors.

Types are defined in `src/common/dto/error-response.dto.ts` (`ErrorResponseDto`, `ErrorResponseDetails`, `ValidationErrorItem`).

---

## 3) Global exception filter

- **AllExceptionsFilter** (`src/common/filters/all-exceptions.filter.ts`) – Single global filter registered with `APP_FILTER` in `AppModule`. Catches all exceptions and normalizes them to the standard shape.
- **HttpException** – Nest built-in exceptions (`NotFoundException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException`, `BadRequestException`, etc.) are mapped to the same shape; status and message preserved.
- **Validation errors** – When the exception is a `BadRequestException` with an array of messages (from ValidationPipe), the filter sets `message: "Validation failed"` and builds `details.errors` (supports both string arrays and `{ property, constraints }` from a custom `exceptionFactory`).
- **Prisma errors** – `P2002` (unique constraint) → 409 Conflict; `P2025` (record not found) → 404 Not Found.
- **Unknown errors** – Any other exception (e.g. `Error`) → 500; in production the response message is generic (`"Internal server error"`); full error and stack are only logged (with trace ID).
- **Logging** – Filter injects `TraceContextService` and `TraceLoggerService`: 4xx logged at `warn`, 5xx at `error` with stack.

---

## 4) Replaced raw `throw new Error()` with HTTP exceptions

Application code now uses Nest HTTP exceptions so the filter can return the correct status and shape:

- **auth.service.ts** – `BadRequestException` for missing `fullName` (teacher) or `name`/`age`/`grade` (student); `InternalServerErrorException` when JWT secrets are not configured.
- **jwt.strategy.ts** – `InternalServerErrorException` when `JWT_ACCESS_SECRET` is missing.
- **student.repository.prisma.ts** – `InternalServerErrorException` when `seedIfEmpty` is called with a row missing `userId`.

The only remaining `throw new Error()` is in `src/config/database-url.ts`, used at bootstrap/CLI when DB config is missing (no HTTP context).

---

## 5) Project structure (Day 06 additions)

```
src/
  common/
    dto/
      error-response.dto.ts    # ErrorResponseDto, ErrorResponseDetails, ValidationErrorItem
    filters/
      index.ts
      all-exceptions.filter.ts # Global filter: HttpException, validation, Prisma, unknown
  app.module.ts                # APP_FILTER → AllExceptionsFilter
```

---

## 6) Run & verify (Day 06)

- No new env vars or migrations.
- **Validation:** Send invalid body (e.g. `POST /api/auth/login` with `{}`) → 400, `message: "Validation failed"`, `details.errors` array.
- **404:** `GET /api/students/<non-existent-uuid>` → 404 with standard shape and optional `traceId`.
- **401/403/409:** Use existing auth and conflict scenarios; all return the same response shape and `traceId` when available.
- **Production:** 500 responses never expose stack or internal error message; only generic message and `traceId` are returned.

---
