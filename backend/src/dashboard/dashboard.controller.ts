import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async getStats(@GetUser() user: any) {
    const userId = user.id;

    // 1. Total projects owned by user
    const totalProjects = await this.prisma.project.count({
      where: { ownerId: userId },
    });

    // 2. All tasks related to user's projects
    const totalTasks = await this.prisma.task.count({
      where: { project: { ownerId: userId } },
    });

    const pendingTasks = await this.prisma.task.count({
      where: { project: { ownerId: userId }, status: 'TODO' },
    });

    const inProgressTasks = await this.prisma.task.count({
      where: { project: { ownerId: userId }, status: 'IN_PROGRESS' },
    });

    const completedTasks = await this.prisma.task.count({
      where: { project: { ownerId: userId }, status: 'COMPLETED' },
    });

    const highPriorityTasks = await this.prisma.task.count({
      where: {
        project: { ownerId: userId },
        priority: 'HIGH',
        status: { not: 'COMPLETED' },
      },
    });

    const overdueTasks = await this.prisma.task.count({
      where: {
        project: { ownerId: userId },
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      },
    });

    return {
      totalProjects,
      totalTasks,
      taskStatus: {
        TODO: pendingTasks,
        IN_PROGRESS: inProgressTasks,
        COMPLETED: completedTasks,
      },
      alerts: {
        highPriority: highPriorityTasks,
        overdue: overdueTasks,
      },
    };
  }
}
