import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { PreferencesDto } from './dto/preferences.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: any) {
    return this.auth.googleLogin(req.user);
  }
}

@Controller('api')
export class MeController {
  constructor(private auth: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return this.auth.me(req.user.userId);
  }

  @Get('me/preferences')
  @UseGuards(JwtAuthGuard)
  getPreferences(@Req() req: any) {
    return this.auth.getPreferences(req.user.userId);
  }

  @Patch('me/preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(@Req() req: any, @Body() dto: PreferencesDto) {
    return this.auth.updatePreferences(req.user.userId, dto.preferredRecipeId ?? null);
  }
}
