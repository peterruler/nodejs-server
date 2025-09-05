import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for dev; restrict in production as needed
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidUnknownValues: false, transform: true }),
  );
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '127.0.0.1');
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
