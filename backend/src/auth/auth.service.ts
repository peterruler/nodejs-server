import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UserType } from './user-type.enum';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  userType: UserType;
}

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async signup(email: string, password: string, userType: UserType = UserType.USER): Promise<{ token: string; user: User }> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.users.create({ email, password: hashed, userType });
    const token = await this.signToken(user);
    return { token, user };
  }

  async signin(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = await this.signToken(user);
    return { token, user };
  }

  private async signToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email, userType: user.userType };
    return this.jwt.signAsync(payload);
  }
}

