import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGuideDto, FaseDto } from './dto/create-guide.dto.js';
import { UpdateGuideDto } from './dto/update-guide.dto.js';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.guide.findMany({ orderBy: { createdAt: 'desc' } }); }

  async findOne(id: string) {
    const g = await this.prisma.guide.findUnique({ where: { id } });
    if (!g) throw new NotFoundException();
    return g;
  }

  create(dto: CreateGuideDto, authorId: string) {
    if (!dto.fases || dto.fases.length < 1) throw new BadRequestException('fases must have at least 1 item');
    return this.prisma.guide.create({ data: { ...dto, fases: this.normalizeFases(dto.fases) as any, authorId } });
  }

  async update(id: string, dto: UpdateGuideDto, userId: string) {
    const g = await this.findOne(id);
    if (g.authorId && g.authorId !== userId) throw new ForbiddenException();
    if (!g.authorId) throw new ForbiddenException(); // seeded guides not editable
    if (dto.fases && dto.fases.length < 1) throw new BadRequestException('fases must have at least 1 item');
    const data: any = { ...dto };
    if (dto.fases) data.fases = this.normalizeFases(dto.fases);
    return this.prisma.guide.update({ where: { id }, data });
  }

  // id gerado por índice (único dentro da receita) e descricao com default ''
  private normalizeFases(fases: FaseDto[]) {
    return fases.map((f, i) => ({
      ...f,
      id: f.id && f.id.trim() ? f.id : `fase-${i + 1}`,
      descricao: f.descricao ?? '',
    }));
  }

  async remove(id: string, userId: string) {
    const g = await this.findOne(id);
    if (g.authorId && g.authorId !== userId) throw new ForbiddenException();
    if (!g.authorId) throw new ForbiddenException();
    return this.prisma.guide.delete({ where: { id } });
  }
}
