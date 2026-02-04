import { Injectable, Logger } from '@nestjs/common';
import { TraceContextService } from './trace-context.service';

/**
 * Logger that includes the current request's trace ID in log output when
 * available. Use this in controllers and services for request-correlated logs.
 */
@Injectable()
export class TraceLoggerService {
  private readonly logger = new Logger(TraceLoggerService.name);

  constructor(private readonly traceContext: TraceContextService) {}

  private prefix(): string {
    const traceId = this.traceContext.getTraceId();
    return traceId ? `[traceId=${traceId}] ` : '';
  }

  log(message: string, ...optionalParams: unknown[]): void {
    this.logger.log(this.prefix() + message, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    this.logger.error(this.prefix() + message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.logger.warn(this.prefix() + message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    this.logger.debug(this.prefix() + message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    this.logger.verbose(this.prefix() + message, ...optionalParams);
  }
}
