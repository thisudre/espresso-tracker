import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new (await import('@nestjs/common')).ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
