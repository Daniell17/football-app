import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ description: 'The title of the news article' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content/body of the news article' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'URL of the cover image', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: 'Whether the news is featured', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
