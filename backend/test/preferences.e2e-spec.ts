import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

// carrega backend/.env (DATABASE_URL, JWT_SECRET) fora do `nest start`
try {
  process.loadEnvFile();
} catch {
  /* sem .env — usa defaults */
}

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const email = `prefs-${suffix}@example.com`;
const password = 'secret123';

describe('Preferências de receita (e2e)', () => {
  let app: INestApplication;
  let token = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name: 'Prefs' })
      .expect(201);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const asUser = () => ({ Authorization: `Bearer ${token}` });

  it('GET /api/me/preferences sem token — 401', async () => {
    await request(app.getHttpServer()).get('/api/me/preferences').expect(401);
  });

  it('GET /api/me/preferences inicia nulo — 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/me/preferences')
      .set(asUser())
      .expect(200);

    expect(res.body.preferredRecipeId).toBeNull();
  });

  it('PATCH /api/me/preferences salva a receita — 200', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/me/preferences')
      .set(asUser())
      .send({ preferredRecipeId: 'v60-suave' })
      .expect(200);

    expect(res.body.preferredRecipeId).toBe('v60-suave');

    const check = await request(app.getHttpServer())
      .get('/api/me/preferences')
      .set(asUser())
      .expect(200);
    expect(check.body.preferredRecipeId).toBe('v60-suave');
  });

  it('PATCH /api/me/preferences limpa a preferência (null) — 200', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/me/preferences')
      .set(asUser())
      .send({ preferredRecipeId: null })
      .expect(200);

    expect(res.body.preferredRecipeId).toBeNull();
  });
});
