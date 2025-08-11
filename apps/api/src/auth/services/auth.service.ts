import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/services/prisma.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        orgUsers: {
          include: { tenant: true },
        },
      },
    });

    if (!user || !user.isActive || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For simplicity, use the first tenant association
    // In a real app, you might want to let users choose their tenant
    const orgUser = user.orgUsers[0];
    if (!orgUser) {
      throw new UnauthorizedException('User not associated with any organization');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: orgUser.tenantId,
      role: orgUser.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: orgUser.tenantId,
        role: orgUser.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if tenant slug is available
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: registerDto.tenantSlug },
    });

    if (existingTenant) {
      throw new ConflictException('Organization slug is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create tenant and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          id: uuidv4(),
          name: registerDto.tenantName,
          slug: registerDto.tenantSlug,
          plan: 'TRIAL',
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          id: uuidv4(),
          email: registerDto.email,
          name: registerDto.name,
          password: hashedPassword,
        },
      });

      // Associate user with tenant as ORG_ADMIN
      await tx.orgUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: 'ORG_ADMIN',
        },
      });

      // Create trial subscription
      await tx.subscription.create({
        data: {
          id: uuidv4(),
          tenantId: tenant.id,
          plan: 'TRIAL',
          status: 'TRIAL',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
      });

      return { user, tenant };
    });

    // Create tenant database
    await this.prisma.createTenantDatabase(result.tenant.id);

    // Generate tokens
    const payload = {
      sub: result.user.id,
      email: result.user.email,
      tenantId: result.tenant.id,
      role: 'ORG_ADMIN',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        tenantId: result.tenant.id,
        role: 'ORG_ADMIN',
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          orgUsers: {
            where: { tenantId: payload.tenantId },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const orgUser = user.orgUsers[0];
      if (!orgUser) {
        throw new UnauthorizedException('User not associated with tenant');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        tenantId: orgUser.tenantId,
        role: orgUser.role,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: orgUser.tenantId,
          role: orgUser.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new BadRequestException('User not found or password not set');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, updateData: { name?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return user;
  }
}

