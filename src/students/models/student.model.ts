/**
 * Domain model for a student (non-ORM). Used by the repository layer and
 * mapped to StudentResponseDto for API responses.
 */
export type StudentModel = {
  id: string;
  name: string;
  age: number;
  grade: number;
  isActive: boolean;
  createdAt: Date;
};
