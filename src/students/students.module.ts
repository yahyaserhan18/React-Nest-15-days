import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { STUDENT_REPOSITORY, StudentRepository } from './repositories';
import { StudentsController } from './students.controller';
import { StudentsSeedService } from './students-seed.service';
import { StudentsService } from './students.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity])],
  controllers: [StudentsController],
  providers: [
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepository,
    },
    StudentsService,
    StudentsSeedService,
  ],
  exports: [STUDENT_REPOSITORY],
})
export class StudentsModule {}
