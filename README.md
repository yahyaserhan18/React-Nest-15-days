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
