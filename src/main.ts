import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino'; // Renomeie para não confundir
import { Logger as NestLogger } from '@nestjs/common'; // Importe o nativo
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  if (process.env.NODE_ENV === 'production') {
    app.useLogger(app.get(PinoLogger));
  } else {
    app.useLogger(new NestLogger());
  }

  const logger =
    process.env.NODE_ENV === 'production'
      ? app.get(PinoLogger)
      : new NestLogger('Bootstrap');

  const dataSource = app.get(DataSource);

  if (dataSource.isInitialized) {
    logger.log('Database: Connected and Ready to Use!');
  } else {
    logger.error('Critical Error: The Database did not connect!');
    process.exit(1);
  }

  await app.listen(process.env.PORT ?? 8080);

  logger.log(`Application running on: ${await app.getUrl()}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
}
bootstrap();
