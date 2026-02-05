import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get() // GET /api/students
  all() {
    return this.studentsService.findAll();
  }

  @Get('all') // GET /api/students/all
  allWithPath() {
    return this.studentsService.findAll();
  }

  @Get('passed') // GET /api/students/passed?minGrade=60
  passed(@Query('minGrade') minGrade?: string) {
    const mg = minGrade ? Number(minGrade) : 50;
    return this.studentsService.passed(mg);
  }

  @Get('averagegrade') // GET /api/students/averagegrade
  averageGrade() {
    return this.studentsService.averageGrade().then((average) => ({ average }));
  }

  @Get(':id/courses') // GET /api/students/:id/courses
  coursesByStudentId(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.studentsService.getCoursesForStudent(id);
  }

  @Get(':id') // GET /api/students/:id
  byId(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.studentsService.findById(id);
  }

  @Delete(':id') // DELETE /api/students/:id
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.studentsService.remove(id);
    return { deleted: true };
  }

  @Put(':id') // PUT /api/students/:id
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Post() // POST /api/students
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }
}
