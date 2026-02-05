import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { type IStudentRepository, STUDENT_REPOSITORY } from './repositories';
import { studentsSeedData } from './seed';

@Injectable()
export class StudentsSeedService implements OnApplicationBootstrap {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly repository: IStudentRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.repository.seedIfEmpty(studentsSeedData);
  }
}
