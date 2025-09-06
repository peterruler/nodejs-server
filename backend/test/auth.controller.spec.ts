import { Test } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const svc = {
    signup: jest.fn(),
    signin: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: svc },
      ],
    }).compile();
    controller = moduleRef.get(AuthController);
    jest.resetAllMocks();
  });

  it('delegates signup', async () => {
    (svc.signup as any).mockResolvedValue({ token: 't', user: { id: 'u1', email: 'a@b.com' } });
    const res = await controller.signup({ email: 'a@b.com', password: 'pw' } as any);
    expect(res).toEqual({ token: 't', user: { id: 'u1', email: 'a@b.com' } });
    expect(svc.signup).toHaveBeenCalled();
  });

  it('delegates signin', async () => {
    (svc.signin as any).mockResolvedValue({ token: 't', user: { id: 'u1', email: 'a@b.com' } });
    const res = await controller.signin({ email: 'a@b.com', password: 'pw' } as any);
    expect(res.token).toBe('t');
    expect(svc.signin).toHaveBeenCalled();
  });

  it('signout returns success', () => {
    expect(controller.signout()).toEqual({ success: true });
  });
});

