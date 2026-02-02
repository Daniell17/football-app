import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HistoryType } from '@prisma/client';

export class CreateHistoryDto {
  @ApiProperty({ description: 'Title of the achievement or trophy' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The year of the event', required: false })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiProperty({ description: 'URL of a photo or trophy image', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: 'Type of historical event', enum: HistoryType, default: HistoryType.ACHIEVEMENT })
  @IsOptional()
  @IsEnum(HistoryType)
  type?: HistoryType;
}
