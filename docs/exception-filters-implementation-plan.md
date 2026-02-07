# Exception Filters — Implementation Plan

This document is a step-by-step plan to add **Exception Filters** to your NestJS backend, so all errors are handled consistently, logged with trace IDs, and returned in a single API response shape.

---

## 1. Goals and scope

**What we want:**

- **Consistent error responses** — Same JSON shape for every error (status, message, code, traceId, optional details).
- **Proper HTTP status codes** — Keep using Nest’s `HttpException` (e.g. `NotFoundException`, `UnauthorizedException`) and map them to the right status.
- **Validation errors** — Format `ValidationPipe` (class-validator) errors into a clear, client-friendly structure (e.g. `details.errors`).
- **Unknown errors** — Catch any unhandled exception (e.g. raw `Error`, Prisma errors), log them, and return a safe 500 response without leaking internals.
- **Logging and trace ID** — Use your existing `TraceLoggerService` and `TraceContextService` so every error is logged with the request’s trace ID and the response body includes `traceId` for support/debugging.

**Out of scope (for this plan):**

- Changing business logic or replacing existing `throw new NotFoundException(...)` etc.
- Authentication/authorization logic (only how those exceptions are formatted).

---

## 2. Standard error response shape

Define one DTO/shape used for all error responses (both 4xx and 5xx):

```ts
// Example shape — to be implemented as DTO or interface
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "traceId": "abc-123",
  "details": { ... }   // optional: validation errors, or null
}
```

- **statusCode** — HTTP status (number).
- **message** — Short, user/client-friendly message (string or string[] for validation).
- **error** — HTTP status text (e.g. `"Bad Request"`, `"Not Found"`).
- **traceId** — From `TraceContextService.getTraceId()` (omit if not in request context).
- **details** — Optional. For validation: e.g. `{ "errors": [ { "field": "email", "messages": ["..."] } ] }`. For other errors: `null` or omit.

Use this shape in all filters so clients can rely on a single contract.

---

## 3. File and module structure

Suggested layout:

```
src/
  common/
    filters/
      index.ts
      http-exception.filter.ts    # Handles HttpException (including Nest built-ins)
      validation-exception.filter.ts  # Handles ValidationPipe / class-validator
      all-exceptions.filter.ts    # Fallback: catches everything else (e.g. Error, Prisma)
    dto/
      error-response.dto.ts       # (Optional) Typed shape for error response
```

- **http-exception.filter.ts** — Catches `HttpException` and its subclasses. Normalizes response (statusCode, message, error, traceId, details) and logs via `TraceLoggerService`.
- **validation-exception.filter.ts** — Catches the exception thrown by `ValidationPipe` (in Nest this is often `BadRequestException` with an array of validation messages). Formats `details.errors` and keeps the same top-level shape.
- **all-exceptions.filter.ts** — Implements `catch(exception: unknown)`. For non-`HttpException`, logs the full error (with trace ID), then returns 500 with a generic message and `traceId`; never expose stack or internal messages to the client.

Registration will be **global** in `main.ts` (or via `APP_FILTER` in `AppModule`). Order of filters matters: Nest uses the first filter that matches. Typically you either:

- Use one **global “all-exceptions” filter** that branches internally on exception type (HttpException vs validation vs unknown), or  
- Register **multiple global filters** in a specific order (e.g. validation first, then HTTP, then all-exceptions).

Recommendation: start with **one global filter** that delegates by type (simpler and one place to maintain). Optionally split into three filters later if you prefer separation.

---

## 4. Exception types to handle

| Source | Type / Example | Status | Action |
|--------|-----------------|--------|--------|
| Nest built-in | `NotFoundException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException`, `BadRequestException`, etc. | 404, 409, 401, 403, 400 | Map to standard shape; log; return as-is for status. |
| ValidationPipe | `BadRequestException` with validation messages (array/object) | 400 | Format `details.errors`; message e.g. "Validation failed". |
| Prisma | e.g. `P2002` (unique), `P2025` (record not found) | 409, 404 | Map known codes to status/message; others → 500. |
| Other | `Error`, unknown | 500 | Log full error; return generic message + traceId. |

Ensure **validation** is clearly distinguishable (e.g. by checking `exception.getResponse()` structure or a custom property) so the validation filter (or branch) runs for ValidationPipe and the rest for plain `BadRequestException`.

---

## 5. Logging and trace ID

- **In every filter:**  
  - Get `traceId` from `TraceContextService.getTraceId()`.  
  - Add it to the JSON response body.  
  - Use `TraceLoggerService.error(...)` (or similar) to log the error, including trace ID (your logger already prefixes with trace ID when in request context).

- **What to log:**  
  - For 4xx: log at `warn` or `error` with message and trace ID (avoid logging full stack for expected validation/bad-request).  
  - For 5xx and unknown: log at `error` with message, trace ID, and stack (so you can debug without exposing stack to the client).

---

## 6. Environment-aware behavior

- **Production:**  
  - 500 responses: generic message only; never send stack or internal error message.  
  - Keep `traceId` in response so support can correlate with logs.

- **Non-production (e.g. NODE_ENV !== 'production'):**  
  - Optionally include a non-sensitive hint in `details` (e.g. error name) or a `stack` field for 500s.  
  - Still prefer not to expose DB or internal details; use logs for that.

Use `ConfigService` or `process.env.NODE_ENV` inside the filter to branch.

---

## 7. Step-by-step implementation order

### Step 1 — Define the error response shape

- Add `ErrorResponseDto` (or an interface) in `src/common/dto/error-response.dto.ts` (or `common/filters/`).
- Fields: `statusCode`, `message`, `error`, `traceId?`, `details?`.
- Use this type in filters when building the response object.

### Step 2 — Create the global exception filter (single filter, branch by type)

- Create `src/common/filters/all-exceptions.filter.ts` (or name it `global-exception.filter.ts`).
- Inject `TraceContextService` and `TraceLoggerService` (ensure `CommonModule` exports them if they are in a module; otherwise use a standalone filter and get from `ArgumentsHost.get(HttpAdapterHost).httpAdapter` + app context to resolve services).
- Implement `ExceptionFilter.catch(exception: unknown, host: ArgumentsHost)`:
  - Get `response` from `host.switchToHttp().getResponse()`.
  - Get `traceId` from `TraceContextService.getTraceId()`.
  - **If `exception` is `HttpException`:**
    - Check if it’s a validation-style response (e.g. `exception.getResponse()` has an array of messages or a structure you use for validation). If yes, format as validation error (status 400, `details.errors`).
    - Otherwise, build standard shape from `exception.getResponse()` and `exception.getStatus()`.
  - **Else if Prisma error** (e.g. `exception.code === 'P2002'`): map to 409/404 and standard shape.
  - **Else:** treat as unknown → log with stack, return 500 with generic message and traceId.
- In all branches: set status and send JSON using the same response shape.
- Register globally in `main.ts`: `app.useGlobalFilters(new AllExceptionsFilter(...))`.  
  For dependency injection (TraceContextService, TraceLoggerService), register the filter as an `APP_FILTER` in `AppModule` and implement the filter as an injectable class that gets these deps in the constructor.

### Step 3 — Wire dependency injection for the filter

- Ensure `TraceContextService` and `TraceLoggerService` are provided (and exported) by `CommonModule`.
- Create the filter as an injectable class in `src/common/filters/all-exceptions.filter.ts`, injecting both services.
- In `AppModule`, add:  
  `{ provide: APP_FILTER, useClass: AllExceptionsFilter }`  
  so Nest creates the filter with DI. Remove the `new AllExceptionsFilter(...)` from `main.ts` if you switch to APP_FILTER.

### Step 4 — Format validation errors

- In the branch where you detect ValidationPipe’s exception, parse `exception.getResponse()` (often `{ message: string[] }` or similar).
- Map to your standard shape: `message: "Validation failed"` and `details: { errors: [ { field, messages } ] }` (or a flat list of messages, depending on what class-validator returns and what you want for the client).
- Ensure the response status is 400 and the body matches `ErrorResponseDto`.

### Step 5 — (Optional) Map Prisma errors

- In the filter, detect Prisma client errors (e.g. by `exception.constructor.name === 'PrismaClientKnownRequestError'` or by checking a `code` property).
- Map `P2002` (unique constraint) → 409 Conflict with a safe message.
- Map `P2025` (record not found) → 404 Not Found.
- For any other Prisma code, either map to 400 or fall back to 500 with a generic message; log the code and message internally.

### Step 6 — Replace raw `throw new Error()` in application code (optional but recommended)

- In `auth.service.ts`, `jwt.strategy.ts`, `config/database-url.ts`, `student.repository.prisma.ts`, etc., replace `throw new Error(...)` with appropriate Nest HTTP exceptions (`BadRequestException`, `InternalServerErrorException`, etc.) or custom exceptions that extend `HttpException`.
- This way the global filter will always receive known types and you avoid accidental 500 with generic “Internal server error” for business/config errors that are better expressed as 400/401/500 with a clear message.

### Step 7 — Export and tests

- Export the filter (and optional DTO) from `src/common/filters/index.ts`.
- Add e2e or unit tests: send invalid payloads (validation), call missing resources (404), and trigger an internal error (e.g. mock that throws `Error`); assert status codes and response shape (including `traceId` and no stack in production-like mode).

---

## 8. Optional: custom exceptions

If you want domain-specific errors (e.g. `CourseNotFoundError`) that still go through the same filter:

- Create classes that extend `HttpException` (or a base like `NotFoundException`) and throw them from services.
- The global filter will treat them as `HttpException` and format them with the standard shape. No extra filter logic needed unless you want special `details` for that type.

---

## 9. Checklist before considering it done

- [ ] All error responses use the same JSON shape (statusCode, message, error, traceId, details?).
- [ ] Validation errors return 400 with a clear `details.errors` (or equivalent).
- [ ] Nest built-in exceptions (404, 401, 403, 409, etc.) return the correct status and the standard shape.
- [ ] Unknown/raw errors return 500, are fully logged with trace ID (and stack), and never expose stack or internal message to the client in production.
- [ ] Trace ID is present in error responses when the request passed through `TraceIdMiddleware`.
- [ ] Optional: Prisma P2002/P2025 mapped to 409/404.
- [ ] Optional: Raw `throw new Error()` replaced with HTTP or custom exceptions.
- [ ] Filter registered globally (via `APP_FILTER` or `main.ts`) and covered by at least one test.

---

## 10. Summary

| Step | Action |
|------|--------|
| 1 | Define `ErrorResponseDto` / standard error shape. |
| 2 | Implement one global exception filter that branches on exception type (HttpException, validation, Prisma, unknown). |
| 3 | Register filter with DI (`APP_FILTER` + inject TraceContextService, TraceLoggerService). |
| 4 | Format ValidationPipe errors into `details.errors`. |
| 5 | (Optional) Map Prisma P2002/P2025 to 409/404. |
| 6 | (Optional) Replace `throw new Error()` with HTTP exceptions. |
| 7 | Export filter, add tests, and verify production-safe 500 responses. |

After this, you can implement step by step and adjust the plan (e.g. split into three filters or add more Prisma codes) as needed.
