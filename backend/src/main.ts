import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, //auto transorm payload jadi instance dto class
    transformOptions: {
      enableImplicitConversion: true, //auto convert string -> number
    }
  }))
  const config = new DocumentBuilder()
  .setTitle('Kompak API')
  .setDescription('API Documentation')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      in: 'header',
      description: 'Input jwt'
    },
    'access-token',
  ).build()
  const document =  SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs',app,document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
