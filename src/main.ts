import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { ValidationError } from 'class-validator';

// somewhere in your code

async function bootstrap() {
  let app;
  if (process.env.ENVIRONMENT !== 'DEVELOPMENT') {
    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key: fs.readFileSync(process.env.PRIVATE_KEY_FILE),
        cert: fs.readFileSync(process.env.CERT_FILE),
      },
    });
  } else {
    app = await NestFactory.create(AppModule);
  }

  const options = new DocumentBuilder()
    .setTitle('API WebRTC Platform')
    .setDescription('This is a experimental project using DDD architecture')
    .setVersion('1.0')
    .addTag('DDD')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = {};
        validationErrors.forEach((value) => {
          errors[value.property] = {
            ...value.constraints,
          };
        });
        return new BadRequestException({ validationMessage: errors });
      },
    }),
  );
  app.enableCors();
  app.use(helmet());

  await app.listen(3000);
}
bootstrap();
