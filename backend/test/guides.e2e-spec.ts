import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// carrega backend/.env (DATABASE_URL, JWT_SECRET) fora do `nest start`
try {
  process.loadEnvFile();
} catch {
  /* sem .env — usa defaults */
}

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const ownerEmail = `owner-${suffix}@example.com`;
const otherEmail = `other-${suffix}@example.com`;
const password = 'secret123';

const validGuide = {
  method: 'v60',
  nome: 'Receita E2E',
  foco: 'Teste de CRUD',
  moagem: 'média',
  baseDose: 20,
  tempoTotalEstimado: 150,
  // cliente não envia id nem descricao (AC GUIDE-API-04)
  fases: [{ nome: 'Bloom', tempoObjetivo: 30, volumeAgua: 40 }],
};

describe('Guides (e2e)', () => {
  let app: INestApplication;
  let ownerToken = '';
  let otherToken = '';
  let guideId = '';

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const owner = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: ownerEmail, password, name: 'Owner' })
      .expect(201);
    ownerToken = owner.body.accessToken;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: otherEmail, password, name: 'Other' })
      .expect(201);
    otherToken = other.body.accessToken;
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService, { strict: false });
    if (guideId) await prisma.guide.deleteMany({ where: { id: guideId } });
    await prisma.user.deleteMany({ where: { email: { in: [ownerEmail, otherEmail] } } });
    await app.close();
  });

  it('GET /api/guides é público e lista as receitas seed — 200', async () => {
    const res = await request(app.getHttpServer()).get('/api/guides').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body.map((g: any) => g.id)).toEqual(expect.arrayContaining(['v60-equilibrada']));
  });

  it('GET /api/guides/:id público — 200', async () => {
    const res = await request(app.getHttpServer()).get('/api/guides/v60-equilibrada').expect(200);
    expect(res.body.nome).toBe('V60 Equilibrada');
    expect(res.body.fases.length).toBe(3);
  });

  it('GET /api/guides/:id inexistente — 404', async () => {
    await request(app.getHttpServer()).get('/api/guides/nao-existe').expect(404);
  });

  it('POST /api/guides sem token — 401', async () => {
    await request(app.getHttpServer()).post('/api/guides').send(validGuide).expect(401);
  });

  it('POST /api/guides com payload inválido — 400', async () => {
    await request(app.getHttpServer())
      .post('/api/guides')
      .set(auth(ownerToken))
      .send({ method: 'v60', fases: [] })
      .expect(400);
  });

  it('POST /api/guides cria receita, gera id/descricao da fase e seta authorId — 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/guides')
      .set(auth(ownerToken))
      .send(validGuide)
      .expect(201);

    guideId = res.body.id;
    expect(res.body.nome).toBe('Receita E2E');
    expect(res.body.fases[0].id).toBe('fase-1');
    expect(res.body.fases[0].descricao).toBe('');
    expect(res.body.authorId).toBeTruthy();
  });

  it('PATCH /api/guides/:id pelo dono — 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/guides/${guideId}`)
      .set(auth(ownerToken))
      .send({ nome: 'Renomeada E2E' })
      .expect(200);

    expect(res.body.nome).toBe('Renomeada E2E');
  });

  it('PATCH /api/guides/:id por usuário diferente — 403', async () => {
    await request(app.getHttpServer())
      .patch(`/api/guides/${guideId}`)
      .set(auth(otherToken))
      .send({ nome: 'Invasora' })
      .expect(403);
  });

  it('DELETE /api/guides/:id por usuário diferente — 403', async () => {
    await request(app.getHttpServer())
      .delete(`/api/guides/${guideId}`)
      .set(auth(otherToken))
      .expect(403);
  });

  it('DELETE /api/guides/:id pelo dono — 200 e depois GET — 404', async () => {
    await request(app.getHttpServer())
      .delete(`/api/guides/${guideId}`)
      .set(auth(ownerToken))
      .expect(200);

    await request(app.getHttpServer()).get(`/api/guides/${guideId}`).expect(404);
  });
});
