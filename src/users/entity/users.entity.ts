import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoles } from '../enum/roles.enum';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => EnterpriseEntity, (enterprise) => enterprise.users, {
    nullable: true,
  })
  enterprise: EnterpriseEntity;
}
