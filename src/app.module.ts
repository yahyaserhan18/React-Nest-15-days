import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppSeedService } from './app-seed.service';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { CommonModule } from './common/common.module';
import { TraceIdMiddleware } from './middleware/trace-id.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { CoursesSeedService } from './courses/courses-seed.service';
import { TeachersSeedService } from './teachers/teachers-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
        convert: true,
      },
    }),
    PrismaModule,
    CommonModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TraceIdMiddleware,
    TeachersSeedService,
    CoursesSeedService,
    AppSeedService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceIdMiddleware).forRoutes('*path');
  }
}
