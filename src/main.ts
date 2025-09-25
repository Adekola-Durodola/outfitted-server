import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ForbiddenException, VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerDocumentOptions, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './app.config'; 

async function bootstrap() {
  let whitelist = [AppConfig().PUBLIC_ROOT_URL];

  let globalPrefix = 'api';
  let app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(origin);
        callback(new ForbiddenException("CORS Error"));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });
  app.use(cookieParser());
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });
  app.useGlobalPipes(new ValidationPipe());
  let options: SwaggerDocumentOptions =  {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  }
  let swaggerConfig = new DocumentBuilder()
    .setTitle('OUTFITTED DOCUMENTATION')
    .setDescription('API documentation for OUTFITTED')
    .setVersion('1.0.0')
    .build();
  let document = SwaggerModule.createDocument(app, swaggerConfig, options);
  SwaggerModule.setup('docs', app, document);
  await app.listen(AppConfig().PORT);
}
bootstrap();
