import { Controller, Get, Param } from '@nestjs/common';
import { NewsService } from './news.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published news articles' })
  findAll() {
    return this.newsService.findAll();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured news articles' })
  findFeatured() {
    return this.newsService.findFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a news article by ID' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}
