import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { formatValidationErrors } from './common/helpers/validation-error.helper';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('URL_ORIGIN'),
    credentials: true,
    exposedHeaders: ['Content-Disposition']
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      exceptionFactory(errors) {
        const formatted = formatValidationErrors(errors);
        return new BadRequestException(formatted)
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '127.0.0.1');
}
void bootstrap();
