import { Controller, Delete, Get, Param, Patch, Post, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { IssueTrackerService } from './issuetracker.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

// Match frontend routes: /Project and /Issue
@UseGuards(JwtAuthGuard)
@Controller()
export class IssueTrackerController {
  constructor(private readonly svc: IssueTrackerService) {}

  // Projects
  @Get('Project')
  listProjects(@Req() req: Request) {
    const userId = (req as any).user.userId as string;
    return this.svc.listProjects(userId);
  }

  @Get('Project/:id')
  getProject(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.userId as string;
    return this.svc.getProject(userId, id);
  }

  @Post('Project')
  createProject(@Req() req: Request, @Body() dto: CreateProjectDto) {
    const userId = (req as any).user.userId as string;
    return this.svc.createProject(userId, dto);
  }

  @Patch('Project/:id')
  patchProject(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const userId = (req as any).user.userId as string;
    return this.svc.updateProject(userId, id, dto);
  }

  // Issues
  @Get('Issue')
  listIssues(@Req() req: Request, @Query('projectId') projectId?: string) {
    const userId = (req as any).user.userId as string;
    return this.svc.listIssues(userId, projectId);
  }

  @Get('Issue/:id')
  getIssue(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.userId as string;
    return this.svc.getIssue(userId, id);
  }

  @Post('Issue')
  createIssue(@Req() req: Request, @Body() dto: CreateIssueDto) {
    const userId = (req as any).user.userId as string;
    return this.svc.createIssue(userId, dto);
  }

  @Put('Issue/:id')
  putIssue(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateIssueDto) {
    const userId = (req as any).user.userId as string;
    return this.svc.updateIssue(userId, id, dto);
  }

  @Patch('Issue/:id')
  patchIssue(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateIssueDto) {
    const userId = (req as any).user.userId as string;
    return this.svc.updateIssue(userId, id, dto);
  }

  @Delete('Issue/:id')
  deleteIssue(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.userId as string;
    return this.svc.deleteIssue(userId, id);
  }
}
