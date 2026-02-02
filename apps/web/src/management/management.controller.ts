import { Controller, Get, Param } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('management')
@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active technical staff' })
  findAll() {
    return this.managementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a staff member by ID' })
  findOne(@Param('id') id: string) {
    return this.managementService.findOne(id);
  }
}
