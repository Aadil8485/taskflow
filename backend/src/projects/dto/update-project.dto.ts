import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

// Using PartialType automatically makes all fields of CreateProjectDto optional.
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
