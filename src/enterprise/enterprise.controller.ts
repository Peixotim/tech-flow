import { Controller, Body, Post } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseCreateDTO } from './DTOs/enterprise-create.dto';

@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Post()
  public async createEnterprise(@Body() requestCreate: EnterpriseCreateDTO) {
    return await this.enterpriseService.createEnterprise(requestCreate);
  }
}
