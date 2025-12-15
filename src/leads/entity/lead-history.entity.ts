import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LeadsEntity } from './leads.entity';
import { HistoryType } from '../enums/lead-history.enum';

@Entity({ name: 'lead_history' })
export class LeadHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: HistoryType })
  type: HistoryType;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => LeadsEntity, (lead) => lead.history, { onDelete: 'CASCADE' })
  lead: LeadsEntity;

  @CreateDateColumn()
  createdAt: Date;
}
