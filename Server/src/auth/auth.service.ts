import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OrgRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser, JwtPayload } from '../common/types/auth.types.js';
import { EngagementService } from '../engagement/engagement.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly engagement: EngagementService,
  ) {}

  private async signTokens(payload: JwtPayload) {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    if (!dto.organizationName && !dto.organizationSlug) {
      throw new BadRequestException(
        'Provide organizationName (create) or organizationSlug (join)',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    if (dto.organizationSlug) {
      const org = await this.prisma.organization.findUnique({
        where: { slug: dto.organizationSlug.toLowerCase() },
      });
      if (!org) throw new BadRequestException('Organization not found');

      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          memberships: {
            create: {
              organizationId: org.id,
              role: OrgRole.LEARNER,
            },
          },
          streak: { create: {} },
        },
      });

      const tokens = await this.signTokens({
        sub: user.id,
        email: user.email,
        orgId: org.id,
        role: OrgRole.LEARNER,
      });
      return { user: { id: user.id, email: user.email, name: user.name }, org, role: OrgRole.LEARNER, ...tokens };
    }

    const baseSlug = slugify(dto.organizationName!);
    let slug = baseSlug || 'academy';
    let n = 0;
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: dto.organizationName!, slug },
      });
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          memberships: {
            create: { organizationId: org.id, role: OrgRole.OWNER },
          },
          streak: { create: {} },
        },
      });
      return { org, user };
    });

    const tokens = await this.signTokens({
      sub: result.user.id,
      email: result.user.email,
      orgId: result.org.id,
      role: OrgRole.OWNER,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      org: result.org,
      role: OrgRole.OWNER,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: { include: { organization: true }, take: 1 },
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const membership = user.memberships[0];
    if (!membership) {
      throw new UnauthorizedException('User has no organization membership');
    }

    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
      orgId: membership.organizationId,
      role: membership.role,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      org: membership.organization,
      role: membership.role,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: payload.orgId,
          userId: payload.sub,
        },
      },
      include: { user: true, organization: true },
    });
    if (!membership) throw new UnauthorizedException();

    const next: JwtPayload = {
      sub: membership.userId,
      email: membership.user.email,
      orgId: membership.organizationId,
      role: membership.role,
    };
    const tokens = await this.signTokens(next);
    return {
      user: {
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name,
      },
      org: membership.organization,
      role: membership.role,
      ...tokens,
    };
  }

  async me(user: AuthUser) {
    const full = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    const membership = await this.prisma.membership.findUniqueOrThrow({
      where: {
        organizationId_userId: {
          organizationId: user.orgId,
          userId: user.id,
        },
      },
      include: { organization: true },
    });
    const streak = await this.engagement.getStreak(user.id);
    return {
      ...full,
      role: membership.role,
      organization: membership.organization,
      streak,
    };
  }
}
