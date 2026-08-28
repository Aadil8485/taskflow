import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        projectId,
      },
    });
  }

  async findAllByProject(projectId: string, filterDto: TaskFilterDto) {
    const { search, status, priority, assignedTo, sortByDueDate, page, limit } =
      filterDto;

    // Pagination math
    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNumber - 1) * pageSize;

    // Dynamic WHERE clause
    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo && { assignedTo }),
      ...(search && {
        title: { contains: search },
      }),
    };

    const tasks = await this.prisma.task.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: sortByDueDate
        ? { dueDate: sortByDueDate }
        : { createdAt: 'desc' },
      include: { assignee: { select: { id: true, name: true, email: true } } }, // Include the assignee details in the response.
    });

    const total = await this.prisma.task.count({ where });

    return {
      data: tasks,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: { select: { name: true, email: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.task.delete({ where: { id } });
  }
}
