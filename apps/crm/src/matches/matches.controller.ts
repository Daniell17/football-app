import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchFilterDto } from './dto/match-filter.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared';

@ApiTags('admin-matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new match' })
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches with filtering and pagination' })
  findAll(@Query() query: MatchFilterDto) {
    return this.matchesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a match by ID' })
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a match' })
  update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a match' })
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }
}
