import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { coursesSeedData } from './seed';

@Injectable()
export class CoursesSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    const count = await this.prisma.course.count();
    if (count > 0) return;
    await this.prisma.course.createMany({ data: coursesSeedData });
  }
}
