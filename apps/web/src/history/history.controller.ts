import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all historical achievements' })
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a historical record by ID' })
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }
}
