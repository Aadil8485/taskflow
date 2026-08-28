import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DashboardController } from './dashboard/dashboard.controller';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, ProjectsModule, TasksModule],
  controllers: [AppController, DashboardController],
  providers: [AppService],
})
export class AppModule {}
