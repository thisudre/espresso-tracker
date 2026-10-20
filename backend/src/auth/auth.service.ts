import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string) {
    if (process.env.AUTH_REGISTRATION_ENABLED === 'false') {
      throw new ForbiddenException('Cadastro desativado');
    }
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email já cadastrado');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, password: hash, name } });
    return { user: this.sanitize(user), ...this.signTokens(user.id, user.email) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return { user: this.sanitize(user), ...this.signTokens(user.id, user.email) };
  }

  async refresh(refreshToken: string) {
    try {
      const payload: any = this.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'dev-secret' });
      if (payload.type !== 'refresh') throw new Error();
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new Error();
      return this.signTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async googleLogin(profile: { googleId: string; email: string; name: string }) {
    let user = await this.prisma.user.findFirst({ where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] } });
    if (!user) {
      user = await this.prisma.user.create({ data: { email: profile.email, name: profile.name, googleId: profile.googleId } });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { googleId: profile.googleId } });
    }
    return { user: this.sanitize(user), ...this.signTokens(user.id, user.email) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return this.sanitize(user);
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return { preferredRecipeId: user.preferredRecipeId };
  }

  async updatePreferences(userId: string, preferredRecipeId: string | null) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new UnauthorizedException('Usuário não encontrado');
    const user = await this.prisma.user.update({ where: { id: userId }, data: { preferredRecipeId } });
    return { preferredRecipeId: user.preferredRecipeId };
  }

  private signTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email }, { secret: process.env.JWT_SECRET ?? 'dev-secret', expiresIn: '15m' });
    const refreshToken = this.jwt.sign({ sub: userId, email, type: 'refresh' }, { secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'dev-secret', expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
