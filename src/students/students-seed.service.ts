import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { studentsSeedData } from './seed';

@Injectable()
export class StudentsSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    const studentCount = await this.prisma.student.count();
    if (studentCount === 0) {
      await this.prisma.student.createMany({
        data: studentsSeedData.map((row) => ({
          id: row.id,
          name: row.name!,
          age: row.age!,
          grade: row.grade!,
          isActive: row.isActive ?? true,
        })),
      });
    }
    await this.seedCourseEnrollments();
  }

  /**
   * Connect some students to some courses (idempotent). Skips if no students or no courses.
   */
  private async seedCourseEnrollments(): Promise<void> {
    const [students, courses] = await Promise.all([
      this.prisma.student.findMany({ select: { id: true }, take: 20 }),
      this.prisma.course.findMany({ select: { id: true }, orderBy: { code: 'asc' } }),
    ]);
    if (students.length === 0 || courses.length === 0) return;

    const enrollments: { studentId: string; courseId: string }[] = [];
    for (let i = 0; i < Math.min(students.length, 6); i++) {
      const courseIndex = i % courses.length;
      enrollments.push({ studentId: students[i].id, courseId: courses[courseIndex].id });
    }
    for (const { studentId, courseId } of enrollments) {
      const existing = await this.prisma.student.findFirst({
        where: { id: studentId, courses: { some: { id: courseId } } },
      });
      if (existing) continue;
      await this.prisma.student.update({
        where: { id: studentId },
        data: { courses: { connect: { id: courseId } } },
      });
    }
  }
}
