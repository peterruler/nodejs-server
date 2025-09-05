import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Issue } from './entities/issue.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssueTrackerService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
  ) {}

  // Projects
  async listProjects(): Promise<Project[]> {
    return this.projects.find({ order: { createdAt: 'ASC' } });
  }

  async getProject(id: string): Promise<Project> {
    const proj = await this.projects.findOne({ where: { id } });
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }

  async createProject(dto: CreateProjectDto): Promise<Project> {
    const entity = this.projects.create({
      id: dto.id ?? require('node:crypto').randomUUID(),
      name: dto.name,
      active: dto.active ?? true,
    });
    return this.projects.save(entity);
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    const proj = await this.getProject(id);
    Object.assign(proj, dto);
    return this.projects.save(proj);
  }

  // Issues
  async listIssues(projectId?: string): Promise<Issue[]> {
    if (projectId) {
      return this.issues.find({ where: { projectId }, order: { createdAt: 'ASC' } });
    }
    return this.issues.find({ order: { createdAt: 'ASC' } });
  }

  async getIssue(id: string): Promise<Issue> {
    const issue = await this.issues.findOne({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async createIssue(dto: CreateIssueDto): Promise<Issue> {
    // Ensure project exists
    await this.getProject(dto.projectId);
    const entity = this.issues.create({
      id: dto.id ?? require('node:crypto').randomUUID(),
      title: dto.title,
      priority: dto.priority,
      dueDate: dto.dueDate,
      done: dto.done ?? false,
      projectId: dto.projectId,
    });
    return this.issues.save(entity);
  }

  async updateIssue(id: string, dto: UpdateIssueDto): Promise<Issue> {
    const issue = await this.getIssue(id);
    Object.assign(issue, dto);
    return this.issues.save(issue);
  }

  async deleteIssue(id: string): Promise<void> {
    const res = await this.issues.delete(id);
    if (!res.affected) throw new NotFoundException('Issue not found');
  }
}
