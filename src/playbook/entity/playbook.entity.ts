import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { UsersEntity } from 'src/users/entity/users.entity';
import { PlaybookType } from '../enums/playbook-type.enum';

@Entity({ name: 'playbooks' })
export class PlaybookEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'enum', enum: PlaybookType })
  type: PlaybookType;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tips?: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fileType?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fileSize?: string;

  @ManyToOne(() => EnterpriseEntity, { nullable: false, onDelete: 'CASCADE' })
  enterprise: EnterpriseEntity;

  @ManyToOne(() => UsersEntity, { nullable: false })
  author: UsersEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
