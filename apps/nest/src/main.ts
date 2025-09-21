import { Logger, type LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(process.env.LOG_LEVEL),
  });

  // Enable global logging interceptor for detailed logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, // Convert string values to their proper types
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

function getLogLevels(level?: string): LogLevel[] {
  const levels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  const logLevel = level?.toLowerCase() || 'log';
  const levelIndex = levels.indexOf(logLevel as LogLevel);

  if (levelIndex === -1) {
    return levels.slice(0, 3); // Default to error, warn, log
  }

  return levels.slice(0, levelIndex + 1);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
