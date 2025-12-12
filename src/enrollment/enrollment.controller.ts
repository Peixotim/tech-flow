import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollment.service';
import { CreateEnrollmentDTO } from './DTOs/enrollment-create.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

interface UserWithEnterprise {
  enterprise: {
    uuid: string;
  };
}

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new enrollment (Convert Lead to Customer)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Enrollment created successfully. Lead status updated to WON.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lead not found or does not belong to this enterprise.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiBody({ type: CreateEnrollmentDTO })
  public async create(
    @Body() createDto: CreateEnrollmentDTO,
    @CurrentUser() user: UserWithEnterprise,
  ) {
    return await this.enrollmentsService.create(
      createDto,
      user.enterprise.uuid,
    );
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get enrollment metrics for Dashboard (Revenue & Counts)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns aggregated metrics for the dashboard.',
    schema: {
      example: {
        totalRevenue: 14500.0,
        enrollmentsToday: 5,
      },
    },
  })
  public async getMetrics(@CurrentUser() user: UserWithEnterprise) {
    return await this.enrollmentsService.getMetrics(user.enterprise.uuid);
  }
}
