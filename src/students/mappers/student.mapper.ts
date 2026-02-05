import { StudentResponseDto } from '../dto/student-response.dto';
import { StudentModel } from '../models/student.model';

/**
 * Maps a domain model to the API response DTO. createdAt is serialized as ISO 8601 string.
 */
export function toStudentResponseDto(model: StudentModel): StudentResponseDto {
  return {
    id: model.id,
    name: model.name,
    age: model.age,
    grade: model.grade,
    isActive: model.isActive,
    createdAt: model.createdAt.toISOString(),
  };
}
