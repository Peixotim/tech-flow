import { EnrollmentEntity } from 'src/enrollment/entity/enrollment.entity';
import { LeadsEntity } from 'src/leads/entity/leads.entity';
import { UsersEntity } from 'src/users/entity/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'enterprise' })
export class EnterpriseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index()
  @Column({ unique: true, length: 50 })
  slug: string; //Vai servir como se fosse um nickname (exemplo : Nome(Escola Estadual Antônio Silva , no slug fica EEAS))

  @Column({ nullable: false, length: 18, unique: true })
  cnpj: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'primary_color', default: '#000000', length: 7 })
  primaryColor: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => UsersEntity, (users) => users.enterprise)
  users: UsersEntity[];

  @OneToMany(() => LeadsEntity, (leads) => leads.enterprise)
  leads: LeadsEntity[];

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.enterprise)
  enrollments: EnrollmentEntity[];

  @Column({
    name: 'monthly_goal',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 10000.0,
  })
  monthlyGoal: number;
}
