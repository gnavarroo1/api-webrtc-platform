import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

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
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(helmet());
  // mongoose.set('debug', true);
  await app.listen(3000);
}
bootstrap();
