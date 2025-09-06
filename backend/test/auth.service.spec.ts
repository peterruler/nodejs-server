import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserType } from '../src/auth/user-type.enum';

describe('AuthService', () => {
  let service: AuthService;
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
  } as unknown as jest.Mocked<JwtService>;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AuthService(users, jwt);
  });

  it('signup creates user with hashed password and returns token', async () => {
    (users.findByEmail as any).mockResolvedValue(null);
    (users.create as any).mockImplementation(async (u: any) => ({ id: 'u1', ...u }));

    const { token, user } = await service.signup('new@example.com', 'password', UserType.USER);
    expect((jwt.signAsync as any)).toHaveBeenCalled();
    expect(user.email).toBe('new@example.com');
    expect(user.password).not.toBe('password');
    const ok = await bcrypt.compare('password', user.password);
    expect(ok).toBe(true);
  });

  it('signup throws ConflictException if email already exists', async () => {
    (users.findByEmail as any).mockResolvedValue({ id: 'u1', email: 'existing@example.com' });
    await expect(service.signup('existing@example.com', 'password'))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('signin returns token for valid credentials', async () => {
    const hashed = await bcrypt.hash('password', 10);
    (users.findByEmail as any).mockResolvedValue({ id: 'u1', email: 'e@x.com', password: hashed, userType: UserType.USER });
    const { token, user } = await service.signin('e@x.com', 'password');
    expect((jwt.signAsync as any)).toHaveBeenCalled();
    expect(user.email).toBe('e@x.com');
  });

  it('signin throws Unauthorized for unknown email', async () => {
    (users.findByEmail as any).mockResolvedValue(null);
    await expect(service.signin('no@x.com', 'pw')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signin throws Unauthorized for wrong password', async () => {
    const hashed = await bcrypt.hash('otherpw', 10);
    (users.findByEmail as any).mockResolvedValue({ id: 'u1', email: 'e@x.com', password: hashed, userType: UserType.USER });
    await expect(service.signin('e@x.com', 'password')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
