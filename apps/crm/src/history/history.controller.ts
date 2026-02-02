import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin-history')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a historical record' })
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all historical records' })
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a historical record by ID' })
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a historical record' })
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(id, updateHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a historical record' })
  remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }
}
