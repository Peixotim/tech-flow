import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksEntity } from './entity/tasks.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TasksController],
  imports: [TypeOrmModule.forFeature([TasksEntity]), UsersModule],
  providers: [TasksService],
})
export class TasksModule {}
