/**
 * Standard shape for all error responses (4xx and 5xx).
 * Used by exception filters to keep API responses consistent.
 */
export interface ErrorResponseDto {
  statusCode: number;
  message: string | string[];
  error: string;
  traceId?: string;
  details?: ErrorResponseDetails;
}

/**
 * Optional payload for error details (e.g. validation errors).
 */
export interface ErrorResponseDetails {
  errors?: ValidationErrorItem[];
}

export interface ValidationErrorItem {
  field: string;
  messages: string[];
}
