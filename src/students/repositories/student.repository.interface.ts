import { StudentModel } from '../models/student.model';

export interface IStudentRepository {
  create(data: Partial<StudentModel>): StudentModel;
  save(entity: StudentModel): Promise<StudentModel>;
  find(options?: { where?: Partial<StudentModel>; order?: Record<string, 'ASC' | 'DESC'> }): Promise<StudentModel[]>;
  findOneBy(criteria: Partial<StudentModel>): Promise<StudentModel | null>;
  merge(entity: StudentModel, data: Partial<StudentModel>): StudentModel;
  delete(id: string): Promise<{ affected?: number | null }>;
  count(): Promise<number>;
  findWithGradeGreaterOrEqual(minGrade: number): Promise<StudentModel[]>;
  getAverageGrade(): Promise<number>;
  /** Inserts all items only when the table is empty; no-op otherwise. */
  seedIfEmpty(data: Partial<StudentModel>[]): Promise<void>;
}

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');
