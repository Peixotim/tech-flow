import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CampaingsEntity } from './entity/campaings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CampaingService {
  constructor(
    @InjectRepository(CampaingsEntity)
    private readonly campaingsRepository: Repository<CampaingsEntity>,
  ) {}
}
