import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateProjectDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

