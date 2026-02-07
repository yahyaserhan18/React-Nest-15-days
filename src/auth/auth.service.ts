import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './auth.types';

export type Tokens = { accessToken: string; refreshToken: string; expiresIn: number };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get bcryptRounds(): number {
    return this.config.get<number>('BCRYPT_ROUNDS', 10);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string; role: Role }; tokens: Tokens }> {
    const email = dto.email.toLowerCase();
    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: dto.role,
          isActive: true,
        },
      });

      if (dto.role === Role.TEACHER) {
        if (!dto.fullName) throw new BadRequestException('fullName is required for teacher');
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            fullName: dto.fullName,
            email,
          },
        });
      } else {
        if (dto.name == null || dto.age == null || dto.grade == null) {
          throw new BadRequestException('name, age, and grade are required for student');
        }
        await tx.student.create({
          data: {
            userId: newUser.id,
            name: dto.name,
            age: dto.age,
            grade: dto.grade,
            isActive: true,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: newUser.id },
        include: { teacher: { select: { id: true } }, student: { select: { id: true } } },
      });
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacher?.id ?? null,
      studentId: user.student?.id ?? null,
    };
    const tokens = await this.issueTokens(payload);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<JwtPayload | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) return null;
    const ok = await this.comparePassword(password, user.passwordHash);
    if (!ok) return null;
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacherId ?? null,
      studentId: user.studentId ?? null,
    };
  }

  async login(email: string, password: string): Promise<{ user: { id: string; email: string; role: Role }; tokens: Tokens }> {
    const payload = await this.validateUser(email, password);
    if (!payload) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.issueTokens(payload);
    return {
      user: { id: payload.sub, email: payload.email, role: payload.role },
      tokens,
    };
  }

  async issueTokens(payload: JwtPayload): Promise<Tokens> {
    const accessExpiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!accessSecret || !refreshSecret)
      throw new InternalServerErrorException('JWT secrets not configured');

    const accessExpiresSeconds = this.parseExpiresIn(accessExpiresIn);
    const refreshExpiresSeconds = this.parseExpiresIn(refreshExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        { secret: accessSecret, expiresIn: accessExpiresSeconds },
      ),
      this.jwtService.signAsync(
        { sub: payload.sub, type: 'refresh' },
        { secret: refreshSecret, expiresIn: refreshExpiresSeconds },
      ),
    ]);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(payload.sub, refreshHash);

    const expiresInSeconds = this.parseExpiresIn(accessExpiresIn);
    return { accessToken, refreshToken, expiresIn: expiresInSeconds };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 min in seconds
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] ?? 60);
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    let decoded: { sub: string; type: string };
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(decoded.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session invalid');
    }
    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacherId ?? null,
      studentId: user.studentId ?? null,
    };
    return this.issueTokens(payload);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshTokenHash(userId, null);
  }
}
