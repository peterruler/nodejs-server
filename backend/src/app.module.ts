import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IssueTrackerModule } from './issuetracker/issuetracker.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Project } from './issuetracker/entities/project.entity';
import { Issue } from './issuetracker/entities/issue.entity';
import { ensureDatabaseExists } from './database/ensure-database';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL') || undefined;
        const host = config.get<string>('DB_HOST') || undefined;
        const port = (config.get<string>('DB_PORT') as unknown as string) || undefined;
        const username = config.get<string>('DB_USER') || undefined;
        const password = config.get<string>('DB_PASSWORD') || undefined;
        const database = config.get<string>('DB_NAME') || undefined;

        try {
          await ensureDatabaseExists({ url, host, port, user: username, password, database });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Database existence check failed:', e);
        }

        return {
          type: 'postgres' as const,
          url,
          host,
          port: port ? parseInt(port, 10) : undefined,
          username,
          password,
          database,
          entities: [Project, Issue, User],
          synchronize: true,
          logging: false,
        };
      },
    }),
    IssueTrackerModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
