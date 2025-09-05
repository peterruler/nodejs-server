import { HealthController } from '../src/health.controller';

describe('HealthController', () => {
  it('GET /health returns status ok with metadata', () => {
    const controller = new HealthController();
    const res = controller.getHealth();
    expect(res).toHaveProperty('status', 'ok');
    expect(res).toHaveProperty('uptime');
    expect(typeof res.uptime).toBe('number');
    expect(res).toHaveProperty('timestamp');
    expect(typeof res.timestamp).toBe('string');
    expect(res).toHaveProperty('version');
  });
});

