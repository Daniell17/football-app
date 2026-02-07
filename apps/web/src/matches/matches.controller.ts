import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchFilterDto } from './dto/match-filter.dto';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matches with filtering and pagination' })
  findAll(@Query() query: MatchFilterDto) {
    return this.matchesService.findAll(query);
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
