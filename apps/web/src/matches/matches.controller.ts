import { Controller, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  findAll() {
    return this.matchesService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming matches' })
  findUpcoming() {
    return this.matchesService.findUpcoming();
  }

  @Get('finished')
  @ApiOperation({ summary: 'Get finished matches' })
  findFinished() {
    return this.matchesService.findFinished();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a match by ID' })
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }
}
