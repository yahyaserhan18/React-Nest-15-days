import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TraceLoggerService } from '../common/trace-logger.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentModel } from './models/student.model';
import { type IStudentRepository, STUDENT_REPOSITORY } from './repositories';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly repository: IStudentRepository,
    private readonly traceLogger: TraceLoggerService,
  ) {}

  private mapToResponse(model: StudentModel): StudentResponseDto {
    return {
      id: model.id,
      name: model.name,
      age: model.age,
      grade: model.grade,
      isActive: model.isActive,
      createdAt: model.createdAt.toISOString(),
    };
  }

  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    const model = this.repository.create({
      name: dto.name,
      age: dto.age,
      grade: dto.grade,
      isActive: dto.isActive,
    });
    const saved = await this.repository.save(model);
    return this.mapToResponse(saved);
  }

  async findAll(): Promise<StudentResponseDto[]> {
    const models = await this.repository.find({ order: { createdAt: 'ASC' } });
    return models.map((m) => this.mapToResponse(m));
  }

  async findById(id: string): Promise<StudentResponseDto> {
    const model = await this.repository.findOneBy({ id });
    if (!model) {
      this.traceLogger.warn(`Student not found: ${id}`);
      throw new NotFoundException(`Student ${id} not found`);
    }
    return this.mapToResponse(model);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const model = await this.repository.findOneBy({ id });
    if (!model) {
      this.traceLogger.warn(`Student not found: ${id}`);
      throw new NotFoundException(`Student ${id} not found`);
    }
    const merged = this.repository.merge(model, dto);
    const saved = await this.repository.save(merged);
    return this.mapToResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Student ${id} not found`);
    }
  }

  async passed(minGrade = 50): Promise<StudentResponseDto[]> {
    const models = await this.repository.findWithGradeGreaterOrEqual(minGrade);
    return models.map((m) => this.mapToResponse(m));
  }

  async averageGrade(): Promise<number> {
    return this.repository.getAverageGrade();
  }
}
