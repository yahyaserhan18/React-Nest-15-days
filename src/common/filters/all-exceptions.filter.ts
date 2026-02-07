import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ErrorResponseDto,
  ErrorResponseDetails,
  ValidationErrorItem,
} from '../dto/error-response.dto';
import { TraceContextService } from '../trace-context.service';
import { TraceLoggerService } from '../trace-logger.service';

/** Prisma client error codes we map to HTTP status. */
const PRISMA_UNIQUE_VIOLATION = 'P2002';
const PRISMA_RECORD_NOT_FOUND = 'P2025';

/** HTTP status code to status text. */
const STATUS_TEXT: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

function getStatusText(statusCode: number): string {
  return STATUS_TEXT[statusCode] ?? 'Error';
}

/**
 * Global exception filter. Normalizes all errors to ErrorResponseDto,
 * logs with trace ID, and returns safe 500 for unknown errors.
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly traceContext: TraceContextService,
    private readonly traceLogger: TraceLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const traceId = this.traceContext.getTraceId();

    const body = this.buildErrorResponse(exception, traceId);
    const statusCode = body.statusCode;

    if (exception instanceof HttpException) {
      this.traceLogger.warn(
        `HttpException ${statusCode}: ${JSON.stringify(body.message)}`,
      );
    } else if (statusCode >= 500) {
      this.traceLogger.error(
        (exception instanceof Error ? exception.message : 'Unknown error'),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json(body);
  }

  private buildErrorResponse(exception: unknown, traceId?: string): ErrorResponseDto {
    if (exception instanceof HttpException) {
      return this.normalizeHttpException(exception, traceId);
    }

    const prismaResult = this.tryMapPrismaError(exception, traceId);
    if (prismaResult) return prismaResult;

    return this.normalizeUnknownError(exception, traceId);
  }

  private normalizeHttpException(exception: HttpException, traceId?: string): ErrorResponseDto {
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const statusText = getStatusText(status);

    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      const msg = (raw as { message?: string | string[] }).message;
      const details = this.formatValidationDetails(msg, raw as Record<string, unknown>);

      // Step 4: when we have validation details, use a single client-friendly message
      const message = details
        ? 'Validation failed'
        : (msg ?? exception.message ?? 'Request failed');

      return {
        statusCode: status,
        message,
        error: (raw as { error?: string }).error ?? statusText,
        traceId,
        ...(details && { details }),
      };
    }

    const message = typeof raw === 'string' ? raw : exception.message;
    return {
      statusCode: status,
      message: message ?? 'Request failed',
      error: statusText,
      traceId,
    };
  }

  /**
   * If response has message as string[], treat as validation and build details.errors.
   * Supports default ValidationPipe format and object arrays (e.g. from exceptionFactory).
   */
  private formatValidationDetails(
    message: unknown,
    raw: Record<string, unknown>,
  ): ErrorResponseDetails | undefined {
    if (Array.isArray(message) && message.length > 0) {
      const errors: ValidationErrorItem[] = message.every((m): m is string => typeof m === 'string')
        ? [{ field: 'body', messages: message }]
        : (message as Array<{ property?: string; constraints?: Record<string, string> }>).map(
            (e) => ({
              field: e.property ?? 'body',
              messages: e.constraints ? Object.values(e.constraints) : [String(e)],
            }),
          );
      return { errors };
    }
    if (Array.isArray(raw.message) && raw.message.length > 0) {
      const arr = raw.message as unknown[];
      const errors: ValidationErrorItem[] = arr.every((m): m is string => typeof m === 'string')
        ? [{ field: 'body', messages: arr as string[] }]
        : (arr as Array<{ property?: string; constraints?: Record<string, string> }>).map(
            (e) => ({
              field: e.property ?? 'body',
              messages: e.constraints ? Object.values(e.constraints) : [String(e)],
            }),
          );
      return { errors };
    }
    return undefined;
  }

  private tryMapPrismaError(exception: unknown, traceId?: string): ErrorResponseDto | null {
    const code = (exception as { code?: string })?.code;
    const meta = (exception as { meta?: { target?: string[] } })?.meta;

    if (code === PRISMA_UNIQUE_VIOLATION) {
      const target = meta?.target?.join(', ');
      return {
        statusCode: HttpStatus.CONFLICT,
        message: target ? `Duplicate value for field(s): ${target}` : 'Resource already exists',
        error: getStatusText(HttpStatus.CONFLICT),
        traceId,
      };
    }
    if (code === PRISMA_RECORD_NOT_FOUND) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        error: getStatusText(HttpStatus.NOT_FOUND),
        traceId,
      };
    }
    return null;
  }

  private normalizeUnknownError(exception: unknown, traceId?: string): ErrorResponseDto {
    const isProduction = process.env.NODE_ENV === 'production';
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction ? 'Internal server error' : message,
      error: getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
      traceId,
    };
  }
}
