import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlaybookService } from './playbook.service';
import { CreatePlaybookDTO } from './DTOs/playbook-create.dto';
import { PlaybookType } from './enums/playbook-type.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';

@ApiTags('Playbook')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playbooks')
export class PlaybookController {
  constructor(private readonly playbookService: PlaybookService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new item in the playbook',
    description:
      'Creates a Script, WhatsApp Template, or Material. If marked as private, only the author can see it.',
  })
  @ApiResponse({
    status: 201,
    description: 'Playbook item created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed).' })
  @ApiResponse({
    status: 404,
    description: 'User or Enterprise not found.',
  })
  public async create(
    @CurrentUser() user: { uuid: string },
    @Body() dto: CreatePlaybookDTO,
  ) {
    return await this.playbookService.create(user.uuid, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List playbook items',
    description:
      'Returns items belonging to the user company. Includes public items + user private items.',
  })
  @ApiQuery({
    name: 'type',
    enum: PlaybookType,
    required: false,
    description: 'Filter by content type (SCRIPT, WHATSAPP, MATERIAL)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or content text',
  })
  @ApiResponse({
    status: 200,
    description: 'List of items returned successfully.',
  })
  @ApiResponse({ status: 404, description: 'User context not found.' })
  public async findAll(
    @CurrentUser() user: { uuid: string },
    @Query('type') type?: PlaybookType,
    @Query('search') search?: string,
  ) {
    return await this.playbookService.findAll(user.uuid, type, search);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a playbook item',
    description:
      'Removes an item. Only the Author or an Admin can delete content.',
  })
  @ApiResponse({
    status: 200,
    description: 'Content deleted successfully.',
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden. You don't have permission to delete this item.",
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  public async delete(
    @CurrentUser() user: { uuid: string },
    @Param('id') id: string,
  ) {
    return await this.playbookService.delete(user.uuid, id);
  }
}
