import {Controller, Get} from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return {
      service: 'TAWĀWUNAK API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        auth: '/auth',
        projects: '/projects',
        users: '/users',
        institutions: '/institutions'
      },
      ts: new Date().toISOString()
    };
  }

  @Get('/health')
  getHealth() {
    return { ok: true, service: 'api', ts: new Date().toISOString() };
  }
}

