import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDTO } from './DTOs/tasks-create.dto';
import { UpdateStatusTaskDTO } from './DTOs/tasks-update-status.dto';
import { TaskResponseDTO } from './DTOs/tasks-reponse.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateDescriptionTaskDTO } from './DTOs/tasks-update-description.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully.',
    type: TaskResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async createTask(
    @CurrentUser() user: { uuid: string },
    @Body() requestCreate: CreateTaskDTO,
  ) {
    return await this.tasksService.createTask(user.uuid, requestCreate);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks returned successfully.',
    type: [TaskResponseDTO],
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async getAllTasks(@CurrentUser() user: { uuid: string }) {
    return await this.tasksService.getAllTasks(user.uuid);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden action.' })
  @ApiResponse({ status: 404, description: 'Task or User not found.' })
  public async updateStatus(
    @CurrentUser() user: { uuid: string },
    @Param('id') taskUuid: string,
    @Body() requestUpdate: UpdateStatusTaskDTO,
  ) {
    return await this.tasksService.updateStatus(
      user.uuid,
      taskUuid,
      requestUpdate,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({
    status: 204,
    description: 'Task deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden action.' })
  @ApiResponse({ status: 404, description: 'Task or User not found.' })
  public async deleteTask(
    @CurrentUser() user: { uuid: string },
    @Param('id') taskUuid: string,
  ) {
    await this.tasksService.deleteTask(user.uuid, taskUuid);
  }

  @Patch(':id/description')
  @ApiOperation({ summary: 'Update task description' })
  @ApiResponse({
    status: 200,
    description: 'Task description updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden action.' })
  @ApiResponse({ status: 404, description: 'Task or User not found.' })
  public async updateDescription(
    @CurrentUser() user: { uuid: string },
    @Param('id') taskUuid: string,
    @Body() requestUpdate: UpdateDescriptionTaskDTO,
  ) {
    return await this.tasksService.updateDescription(
      user.uuid,
      taskUuid,
      requestUpdate,
    );
  }
}
