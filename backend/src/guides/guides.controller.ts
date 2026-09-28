import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GuidesService } from './guides.service.js';
import { CreateGuideDto } from './dto/create-guide.dto.js';
import { UpdateGuideDto } from './dto/update-guide.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('api/guides')
export class GuidesController {
  constructor(private svc: GuidesService) {}

  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post() @UseGuards(JwtAuthGuard) create(@Body() dto: CreateGuideDto, @Req() req: any) { return this.svc.create(dto, req.user.userId); }
  @Patch(':id') @UseGuards(JwtAuthGuard) update(@Param('id') id: string, @Body() dto: UpdateGuideDto, @Req() req: any) { return this.svc.update(id, dto, req.user.userId); }
  @Delete(':id') @UseGuards(JwtAuthGuard) remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, req.user.userId); }
}
