/**
 * API response shape for a student. createdAt is an ISO 8601 string.
 */
export type StudentResponseDto = {
  id: string;
  name: string;
  age: number;
  grade: number;
  isActive: boolean;
  createdAt: string;
};
