import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CoursesSeedService } from './courses/courses-seed.service';
import { StudentsSeedService } from './students/students-seed.service';
import { TeachersSeedService } from './teachers/teachers-seed.service';

@Injectable()
export class AppSeedService implements OnApplicationBootstrap {
  constructor(
    private readonly teachersSeedService: TeachersSeedService,
    private readonly coursesSeedService: CoursesSeedService,
    private readonly studentsSeedService: StudentsSeedService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.teachersSeedService.seed();
    await this.coursesSeedService.seed();
    await this.studentsSeedService.seed();
  }
}
