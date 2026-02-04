import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { StudentEntity } from '../entities/student.entity';
import { IStudentRepository } from './student.repository.interface';

@Injectable()
export class StudentRepository implements IStudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly ormRepository: Repository<StudentEntity>,
  ) {}

  create(data: Partial<StudentEntity>): StudentEntity {
    return this.ormRepository.create(data);
  }

  async save(entity: StudentEntity): Promise<StudentEntity> {
    return this.ormRepository.save(entity);
  }

  async find(options?: {
    where?: Partial<StudentEntity>;
    order?: Record<string, 'ASC' | 'DESC'>;
  }): Promise<StudentEntity[]> {
    return this.ormRepository.find(options);
  }

  async findOneBy(criteria: Partial<StudentEntity>): Promise<StudentEntity | null> {
    return this.ormRepository.findOneBy(criteria as any);
  }

  merge(entity: StudentEntity, data: Partial<StudentEntity>): StudentEntity {
    return this.ormRepository.merge(entity, data);
  }

  async delete(id: string): Promise<{ affected?: number | null }> {
    return this.ormRepository.delete(id);
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }

  async findWithGradeGreaterOrEqual(minGrade: number): Promise<StudentEntity[]> {
    return this.ormRepository.find({
      where: { grade: MoreThanOrEqual(minGrade) },
      order: { createdAt: 'ASC' },
    });
  }

  async getAverageGrade(): Promise<number> {
    const result = await this.ormRepository
      .createQueryBuilder('s')
      .select('AVG(s.grade)', 'avg')
      .getRawOne<{ avg: string | null }>();
    const avg = result?.avg ? parseFloat(result.avg) : 0;
    return Math.round(avg * 100) / 100;
  }
}
