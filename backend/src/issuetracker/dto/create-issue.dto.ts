import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateIssueDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @Length(1, 200)
  title!: string;

  @IsString()
  @IsIn(['1', '2', '3'])
  priority!: string;

  // Accept YYYY-MM-DD
  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsUUID()
  projectId!: string;
}

