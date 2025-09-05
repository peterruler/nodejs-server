import { Controller, Delete, Get, Param, Patch, Post, Put, Body, Query } from '@nestjs/common';
import { IssueTrackerService } from './issuetracker.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

// Match frontend routes: /Project and /Issue
@Controller()
export class IssueTrackerController {
  constructor(private readonly svc: IssueTrackerService) {}

  // Projects
  @Get('Project')
  listProjects() {
    return this.svc.listProjects();
  }

  @Get('Project/:id')
  getProject(@Param('id') id: string) {
    return this.svc.getProject(id);
  }

  @Post('Project')
  createProject(@Body() dto: CreateProjectDto) {
    return this.svc.createProject(dto);
  }

  @Patch('Project/:id')
  patchProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.svc.updateProject(id, dto);
  }

  // Issues
  @Get('Issue')
  listIssues(@Query('projectId') projectId?: string) {
    return this.svc.listIssues(projectId);
  }

  @Get('Issue/:id')
  getIssue(@Param('id') id: string) {
    return this.svc.getIssue(id);
  }

  @Post('Issue')
  createIssue(@Body() dto: CreateIssueDto) {
    return this.svc.createIssue(dto);
  }

  @Put('Issue/:id')
  putIssue(@Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.svc.updateIssue(id, dto);
  }

  @Patch('Issue/:id')
  patchIssue(@Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.svc.updateIssue(id, dto);
  }

  @Delete('Issue/:id')
  deleteIssue(@Param('id') id: string) {
    return this.svc.deleteIssue(id);
  }
}

