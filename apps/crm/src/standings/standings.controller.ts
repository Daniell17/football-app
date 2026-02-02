import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StandingsService } from './standings.service';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared';

@ApiTags('admin-standings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team standing' })
  create(@Body() createStandingDto: CreateStandingDto) {
    return this.standingsService.create(createStandingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all standings' })
  findAll() {
    return this.standingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a standing by ID' })
  findOne(@Param('id') id: string) {
    return this.standingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a standing' })
  update(@Param('id') id: string, @Body() updateStandingDto: UpdateStandingDto) {
    return this.standingsService.update(id, updateStandingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a standing' })
  remove(@Param('id') id: string) {
    return this.standingsService.remove(id);
  }
}
