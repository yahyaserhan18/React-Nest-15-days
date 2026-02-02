# Day 01 - Students API (In-Memory) | NestJS

Simple REST API built with NestJS to practice:
- Modules, Controllers, Services
- Dependency Injection (DI)
- DTOs + ValidationPipe (class-validator)
- Model binding (route params, query params, body)
- In-memory storage (no database)
- UUID id validation (ParseUUIDPipe)

> Note: Data is stored in memory, so it resets on server restart.

---

## Tech Stack
- NestJS
- TypeScript
- class-validator + class-transformer
- Node.js `crypto.randomUUID()` (UUID v4)

---

## Setup & Run

From this folder (`students-api/`):

```bash
npm install
npm run start:dev
```

Base URL:
- `http://localhost:3000/api`

---

## Endpoints

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

## Project Structure

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

## Postman

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
İstekleri çalıştır:

## Notes
- This project uses in-memory array storage (`StudentsService`), no DB.
- Seed data is loaded on app start.
- UUID validation is implemented via `ParseUUIDPipe({ version: '4' })`.
