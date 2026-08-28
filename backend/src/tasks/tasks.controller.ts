import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // POST /projects/:projectId/tasks
  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, createTaskDto);
  }

  // GET /projects/:projectId/tasks
  @Get('projects/:projectId/tasks')
  findAll(
    @Param('projectId') projectId: string,
    @Query() filterDto: TaskFilterDto,
  ) {
    return this.tasksService.findAllByProject(projectId, filterDto);
  }

  // GET /tasks/:id
  @Get('tasks/:id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // PATCH /tasks/:id
  @Patch('tasks/:id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  // DELETE /tasks/:id
  @Delete('tasks/:id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
