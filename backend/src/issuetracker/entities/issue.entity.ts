import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'issues' })
export class Issue {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  // "1", "2", or "3"
  @Index('idx_issues_priority')
  @Column({ type: 'varchar', length: 1 })
  priority!: string;

  @Index('idx_issues_due_date')
  @Column({ name: 'due_date', type: 'date' })
  dueDate!: string;

  @Column({ type: 'boolean', default: false })
  done!: boolean;

  @Index('idx_issues_project_id')
  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.issues, { onDelete: 'CASCADE' })
  project!: Project;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
