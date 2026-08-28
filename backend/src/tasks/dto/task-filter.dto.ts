import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus, Priority } from '../tasks.enum';

export class TaskFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  sortByDueDate?: 'asc' | 'desc';

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}
