import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { LeadsEntity } from 'src/leads/entity/leads.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EnrollmentStatus } from '../enums/enrollment.enum';

@Entity()
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column()
  courseName: string;

  @Column()
  enrollmentDate: Date;
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @OneToOne(() => LeadsEntity)
  @JoinColumn()
  lead: LeadsEntity;

  @Column()
  leadUuid: string;

  @Column()
  enterpriseId: string;

  @ManyToOne(() => EnterpriseEntity)
  @JoinColumn({ name: 'enterpriseId' })
  enterprise: EnterpriseEntity;

  @CreateDateColumn()
  createdAt: Date;
}
