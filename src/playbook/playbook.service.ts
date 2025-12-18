import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PlaybookEntity } from './entity/playbook.entity';
import { CreatePlaybookDTO } from './DTOs/playbook-create.dto';
import { UsersService } from 'src/users/users.service';
import { PlaybookType } from './enums/playbook-type.enum';
import { UserRoles } from 'src/users/enum/roles.enum';
import { DEFAULT_PLAYBOOKS } from './contants/playbooks-default.constant';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { UsersEntity } from 'src/users/entity/users.entity';

@Injectable()
export class PlaybookService {
  constructor(
    @InjectRepository(PlaybookEntity)
    private readonly playbookRepository: Repository<PlaybookEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  public async create(userUuid: string, dto: CreatePlaybookDTO) {
    const author = await this.usersService.findByUuid(userUuid);

    if (!author || !author.enterprise) {
      throw new NotFoundException(
        'User not found or not associated with an enterprise.',
      );
    }

    try {
      const playbook = this.playbookRepository.create({
        ...dto,
        author: author,
        enterprise: author.enterprise,
      });

      return await this.playbookRepository.save(playbook);
    } catch (error) {
      console.error('Error creating playbook item:', error);
      throw new InternalServerErrorException('Failed to save content.');
    }
  }

  public async findAll(userUuid: string, type?: PlaybookType, search?: string) {
    const user = await this.usersService.findByUuid(userUuid);

    if (!user || !user.enterprise) {
      throw new NotFoundException('User access validation failed.');
    }

    const query = this.playbookRepository
      .createQueryBuilder('playbook')
      .leftJoinAndSelect('playbook.author', 'author')
      .where('playbook.enterpriseUuid = :enterpriseId', {
        enterpriseId: user.enterprise.uuid,
      })
      .orderBy('playbook.createdAt', 'DESC');

    query.andWhere(
      new Brackets((qb) => {
        qb.where('playbook.isPrivate = :isPrivate', {
          isPrivate: false,
        }).orWhere('author.uuid = :authorId', { authorId: user.uuid });
      }),
    );

    if (type) {
      query.andWhere('playbook.type = :type', { type });
    }

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('playbook.title ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('playbook.content ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    try {
      return await query.getMany();
    } catch (error) {
      console.error('Error fetching playbook:', error);
      throw new InternalServerErrorException('Could not fetch playbook items.');
    }
  }

  public async delete(userUuid: string, playbookId: string) {
    const user = await this.usersService.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const item = await this.playbookRepository.findOne({
      where: { uuid: playbookId },
      relations: ['author', 'enterprise'],
    });

    if (!item) {
      throw new NotFoundException('Content not found.');
    }

    if (item.enterprise.uuid !== user.enterprise?.uuid) {
      throw new ForbiddenException('Access denied to this resource.');
    }

    const isAuthor = item.author.uuid === user.uuid;
    const isAdmin = user.role === UserRoles.CLIENT_ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this content.',
      );
    }

    try {
      await this.playbookRepository.remove(item);
      return { message: 'Content deleted successfully.' };
    } catch (error) {
      console.error('Error deleting playbook item:', error);
      throw new InternalServerErrorException('Failed to delete item.');
    }
  }

  public async generateDefaultContent(
    enterprise: EnterpriseEntity,
    adminUser: UsersEntity,
  ) {
    try {
      const playbooksToCreate = DEFAULT_PLAYBOOKS.map((item) => {
        return this.playbookRepository.create({
          ...item,
          enterprise: enterprise,
          author: adminUser,
        });
      });

      await this.playbookRepository.save(playbooksToCreate);
      console.log(
        `✅ Default playbooks created for Enterprise ${enterprise.name}`,
      );
    } catch (error) {
      console.error('Error generating default playbooks:', error);
    }
  }
}
