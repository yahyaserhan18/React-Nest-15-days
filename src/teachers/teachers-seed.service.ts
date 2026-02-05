import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { teachersSeedData } from './seed';

@Injectable()
export class TeachersSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    const count = await this.prisma.teacher.count();
    if (count > 0) return;
    await this.prisma.teacher.createMany({ data: teachersSeedData });
  }
}
