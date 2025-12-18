import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoles } from '../enum/roles.enum';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { TasksEntity } from 'src/tasks/entity/tasks.entity';
import type { AvatarConfig } from '../types/users-avatar-config.types';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 512,
    select: false, //Em um select qualquer a senha nao retorna
  })
  password: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.CLIENT_VIEWER })
  role: UserRoles;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  avatarConfig?: AvatarConfig;

  @Column({ type: 'int', default: 1 })
  level?: number;

  @Column({ type: 'int', default: 0 })
  experiencePoints?: number;

  @Column('text', { array: true, default: [] })
  unlockedItems?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => EnterpriseEntity, (enterprise) => enterprise.users, {
    nullable: true,
  })
  enterprise?: EnterpriseEntity;

  @OneToMany(() => TasksEntity, (tasks) => tasks.user)
  tasks?: TasksEntity[];
}
