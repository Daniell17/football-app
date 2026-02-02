import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared';

@ApiTags('admin-management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new staff member' })
  create(@Body() createManagementDto: CreateManagementDto) {
    return this.managementService.create(createManagementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff members' })
  findAll() {
    return this.managementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a staff member by ID' })
  findOne(@Param('id') id: string) {
    return this.managementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff member' })
  update(@Param('id') id: string, @Body() updateManagementDto: UpdateManagementDto) {
    return this.managementService.update(id, updateManagementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a staff member' })
  remove(@Param('id') id: string) {
    return this.managementService.remove(id);
  }
}
