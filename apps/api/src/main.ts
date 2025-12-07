import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import {ConfigService} from '@nestjs/config';
import {AppModule} from './modules/app.module';

async function bootstrap() {
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
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`CORS enabled for: ${webOrigin}`);
}

bootstrap();

