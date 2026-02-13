import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import type { Request, Response } from 'express';
import express from 'express';

const server = express();
let appPromise: Promise<void> | null = null;

function bootstrap() {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
      app.enableCors();
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
      );
      await app.init();
    })();
  }
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}