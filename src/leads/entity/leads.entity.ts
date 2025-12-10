import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToOne(() => EnterpriseEntity, (enterprise) => enterprise.leads)
  enterprise: EnterpriseEntity;
}
