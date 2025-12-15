import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeadStatus } from '../enums/lead-status.enum';
import { LeadHistoryEntity } from './lead-history.entity';

@Entity({ name: 'leads' })
export class LeadsEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 80, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 18 })
  number: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NOVO,
  })
  status: LeadStatus;

  @ManyToOne(() => EnterpriseEntity, (enterprise) => enterprise.leads)
  enterprise: EnterpriseEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeadHistoryEntity, (history) => history.lead)
  history: LeadHistoryEntity[];
}
