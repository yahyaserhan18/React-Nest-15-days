/**
 * Minimal course shape for API responses (e.g. GET /api/students/:id/courses). createdAt is ISO 8601 string.
 */
export type CourseResponseDto = {
  id: string;
  title: string;
  code: string;
  createdAt: string;
};
