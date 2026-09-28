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

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const email = `auth-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = 'secret123';
  let accessToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/register cria o usuário — 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name: 'E2E' })
      .expect(201);

    expect(res.body.user.email).toBe(email);
    expect(res.body.user).not.toHaveProperty('password');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
  });

  it('POST /api/auth/register com email duplicado — 409', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name: 'Duplicado' })
      .expect(409);
  });

  it('POST /api/auth/register com payload inválido — 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'invalido', password: 'curta', name: '' })
      .expect(400);
  });

  it('POST /api/auth/login com credenciais válidas — 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.email).toBe(email);
  });

  it('POST /api/auth/login com senha errada — 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'senha-errada' })
      .expect(401);
  });

  it('POST /api/auth/login com usuário inexistente — 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: `naoexiste-${Date.now()}@example.com`, password })
      .expect(401);
  });

  it('GET /api/me com token — 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('GET /api/me sem token — 401', async () => {
    await request(app.getHttpServer()).get('/api/me').expect(401);
  });

  it('POST /api/auth/refresh renova o access token — 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it('POST /api/auth/refresh com token inválido — 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'token-invalido' })
      .expect(401);
  });
});
