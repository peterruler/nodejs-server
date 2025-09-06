import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserType } from '../auth/user-type.enum';
import { Project } from '../issuetracker/entities/project.entity';
import { Issue } from '../issuetracker/entities/issue.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'user_type', type: 'enum', enum: UserType, default: UserType.USER })
  userType!: UserType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Project, (p) => p.user)
  projects?: Project[];

  @OneToMany(() => Issue, (i) => i.user)
  issues?: Issue[];
}

