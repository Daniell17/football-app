import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  @ApiOperation({ summary: 'Global search across public news and matches' })
  @ApiQuery({ name: 'q', description: 'Search query string', required: true })
  async globalSearch(@Query('q') query: string) {
    return this.searchService.globalSearch(query);
  }
}
