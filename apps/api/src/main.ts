import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global JWT guard (can be overridden with @Public() decorator)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Kasita API')
    .setDescription('Knowledge Acquisition System API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth')
    .addTag('learning-paths')
    .addTag('knowledge-units')
    .addTag('user-progress')
    .addTag('data-sources')
    .addTag('knowledge-graph')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`🚀 API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
