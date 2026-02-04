import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { StudentEntity } from './entities/student.entity';
import { type IStudentRepository, STUDENT_REPOSITORY } from './repositories';
import { studentsSeedData } from './seed';

@Injectable()
export class StudentsSeedService implements OnApplicationBootstrap {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly repository: IStudentRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.repository.count();
    if (count > 0) return;

    for (const row of studentsSeedData) {
      const entity = this.repository.create(row);
      await this.repository.save(entity);
    }
  }
}
