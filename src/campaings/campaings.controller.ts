import { Controller } from '@nestjs/common';
import { CampaingService } from './campaings.service';

@Controller('campaings')
export class CampaingsController {
  constructor(private readonly campaingsService: CampaingService) {}
}
