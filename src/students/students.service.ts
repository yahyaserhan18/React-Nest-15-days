import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from './entities/student.entity';
import { type IStudentRepository, STUDENT_REPOSITORY } from './repositories';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly repository: IStudentRepository,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const entity = this.repository.create({
      name: dto.name,
      age: dto.age,
      grade: dto.grade,
      isActive: dto.isActive,
    });
    return this.repository.save(entity);
  }

  async findAll(): Promise<StudentEntity[]> {
    return this.repository.find({ order: { createdAt: 'ASC' } });
  }

  async findById(id: string): Promise<StudentEntity> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentEntity> {
    const entity = await this.findById(id);
    this.repository.merge(entity, dto);
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Student ${id} not found`);
    }
  }

  async passed(minGrade = 50): Promise<StudentEntity[]> {
    return this.repository.findWithGradeGreaterOrEqual(minGrade);
  }

  async averageGrade(): Promise<number> {
    return this.repository.getAverageGrade();
  }
}
