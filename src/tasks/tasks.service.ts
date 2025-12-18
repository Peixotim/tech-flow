import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksEntity } from './entity/tasks.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateTaskDTO } from './DTOs/tasks-create.dto';
import { UpdateStatusTaskDTO } from './DTOs/tasks-update-status.dto';
import { TaskResponseDTO } from './DTOs/tasks-reponse.dto';
import { UpdateDescriptionTaskDTO } from './DTOs/tasks-update-description.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private readonly tasksRepository: Repository<TasksEntity>,
    private readonly usersService: UsersService,
  ) {}

  public async createTask(userUuid: string, requestCreate: CreateTaskDTO) {
    const user = await this.usersService.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException(`Error: User could not be found!`);
    }

    if (!requestCreate) {
      throw new BadRequestException(`Error: The request was empty!`);
    }

    try {
      const createTask = this.tasksRepository.create({
        ...requestCreate,
        user,
      });

      const saved = await this.tasksRepository.save(createTask);

      return saved;
    } catch (error) {
      console.error(`${error}`);
    }
  }

  public async updateStatus(
    userUuid: string,
    tasksUuid: string,
    requestUpdate: UpdateStatusTaskDTO,
  ) {
    const user = await this.usersService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException(`Error: User could not be found!`);
    }

    if (!requestUpdate) {
      throw new BadRequestException(`Error: The request was empty!`);
    }

    const task = await this.tasksFindByUuuid(tasksUuid);

    if (!task) {
      throw new NotFoundException(`Error: Task not found!`);
    }

    if (task.user.uuid !== user.uuid) {
      throw new ForbiddenException(
        `Error: You cannot change another person's task!`,
      );
    }

    if (task.isDone === requestUpdate.isDone) {
      throw new BadRequestException(
        `Error: You cannot update your task to the same state it is in.`,
      );
    }

    task.isDone = requestUpdate.isDone;

    const saved = await this.tasksRepository.save(task);

    return saved;
  }

  public async tasksFindByUuuid(uuid: string) {
    if (!uuid) {
      throw new BadRequestException(`Error: The request was empty!`);
    }

    const task = await this.tasksRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    return task;
  }

  public async deleteTask(userUuid: string, taskUuid: string) {
    const user = await this.usersService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException(`Error: User could not be found!`);
    }

    const task = await this.tasksFindByUuuid(taskUuid);

    if (!task) {
      throw new NotFoundException(`Error: Task not found!`);
    }

    if (task.user.uuid !== user.uuid) {
      throw new ForbiddenException(
        `Error: You cannot change another person's task!`,
      );
    }

    await this.tasksRepository.remove(task);
  }

  public async getAllTasks(userUuid: string): Promise<TaskResponseDTO[]> {
    const user = await this.usersService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException(`Error: User could not be found!`);
    }

    const tasks = await this.tasksRepository.find({
      where: { user },
      order: { createdAt: 'DESC' },
    });

    if (!tasks || tasks.length === 0) {
      return [];
    }

    const response: TaskResponseDTO[] = tasks.map((task) => ({
      uuid: task.uuid,
      description: task.description,
      isDone: task.isDone,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return response;
  }

  public async updateDescription(
    userUuid: string,
    tasksUuid: string,
    requestUpdate: UpdateDescriptionTaskDTO,
  ) {
    const user = await this.usersService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException(`Error: User could not be found!`);
    }

    if (!requestUpdate) {
      throw new BadRequestException(`Error: The request was empty!`);
    }

    const task = await this.tasksFindByUuuid(tasksUuid);

    if (!task) {
      throw new NotFoundException(`Error: Task not found!`);
    }

    if (task.user.uuid !== user.uuid) {
      throw new ForbiddenException(
        `Error: You cannot change another person's task!`,
      );
    }

    task.description = requestUpdate.description;

    const saved = await this.tasksRepository.save(task);

    return saved;
  }
}
