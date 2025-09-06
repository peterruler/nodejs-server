import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Issue } from './issue.entity';
import { User } from '../../users/user.entity';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Issue, (issue) => issue.project, { cascade: ['remove'] })
  issues?: Issue[];

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'SET NULL' })
  user?: User | null;
}
