import { Module } from '@nestjs/common';
import { STUDENT_REPOSITORY, StudentRepositoryPrisma } from './repositories';
import { StudentsController } from './students.controller';
import { StudentsSeedService } from './students-seed.service';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepositoryPrisma,
    },
    StudentsService,
    StudentsSeedService,
  ],
  exports: [STUDENT_REPOSITORY, StudentsSeedService],
})
export class StudentsModule {}
