import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import {ConfigService} from '@nestjs/config';
import {AppModule} from './modules/app.module';
import {Logger} from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate critical environment variables
  if (!process.env.DATABASE_URL) {
    logger.error('❌ CRITICAL: DATABASE_URL environment variable is not set!');
    logger.error('Please set DATABASE_URL in Railway service variables.');
    logger.error('Go to: Railway Dashboard → api service → Variables → Add DATABASE_URL');
    logger.error('Use: DATABASE_URL=${{Postgres.DATABASE_URL}}');
    process.exit(1);
  }

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter()
    );

    const config = app.get(ConfigService);
    const port = Number(process.env.API_PORT || 4312);
    const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:4320';

    // Get the underlying Fastify instance and register CORS (demo: allow all origins)
    const fastifyInstance = app.getHttpAdapter().getInstance();
    await fastifyInstance.register(require('@fastify/cors'), {
      origin: true, // Allow all origins for demo
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });

    await app.listen({port, host: '0.0.0.0'});
    logger.log(`✅ API running on http://0.0.0.0:${port}`);
    logger.log(`✅ CORS enabled for: ${webOrigin}`);
    logger.log(`✅ Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  } catch (error) {
    logger.error('❌ Failed to start application');
    logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

bootstrap();
