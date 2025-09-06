import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(user: Partial<User>) {
    const entity = this.repo.create(user);
    try {
      return await this.repo.save(entity);
    } catch (e: any) {
      // Postgres unique_violation
      if (e && (e.code === '23505' || /unique/i.test(String(e?.message)))) {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }
}
