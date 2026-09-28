import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GuidesService } from './guides.service.js';
import { GuidesController } from './guides.controller.js';
// fornece AuthModuleOptions para JwtAuthGuard (guards via @UseGuards)
@Module({ imports: [PassportModule.register({ defaultStrategy: 'jwt' })], controllers: [GuidesController], providers: [GuidesService] })
export class GuidesModule {}
