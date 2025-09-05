import { Controller, Get } from '@nestjs/common';
import pkg from '../package.json';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: pkg.version,
    };
  }
}
