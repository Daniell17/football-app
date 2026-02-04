import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientExceptionFilter } from '@app/shared';
import helmet from 'helmet';
import { json } from 'express';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Logic
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"], // Admin API usually doesn't need external HIBP check from client
      },
    },
  }));
  app.use(json({ limit: '100kb' }));
  
  app.enableCors({
    origin: process.env.ALLOWED_CRM_ORIGINS?.split(',') || true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300, // More generous for admin use
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
    }),
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost)); // Register global filter

  const { HttpLoggingInterceptor } = await import('@app/shared');
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Football Club CRM API')
    .setDescription('Administrative API for management and CRUD operations')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.CRM_PORT ?? 3001);
}
bootstrap();
