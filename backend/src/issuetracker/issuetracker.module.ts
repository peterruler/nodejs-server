import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { Project } from './entities/project.entity';
import { IssueTrackerService } from './issuetracker.service';
import { IssueTrackerController } from './issuetracker.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Issue])],
  controllers: [IssueTrackerController],
  providers: [IssueTrackerService],
})
export class IssueTrackerModule {}

