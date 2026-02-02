import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';

export class CreateMatchDto {
  @ApiProperty({ description: 'Name of the home team' })
  @IsString()
  @IsNotEmpty()
  homeTeam: string;

  @ApiProperty({ description: 'Name of the away team' })
  @IsString()
  @IsNotEmpty()
  awayTeam: string;

  @ApiProperty({ description: 'Date and time of the match' })
  @IsDateString()
  @IsNotEmpty()
  matchDate: string;

  @ApiProperty({ description: 'Name of the competition' })
  @IsString()
  @IsNotEmpty()
  competition: string;

  @ApiProperty({ description: 'Venue of the match', required: false })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiProperty({ description: 'Current status', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiProperty({ description: 'Price of a single ticket' })
  @IsNumber()
  @IsNotEmpty()
  ticketPrice: number;

  @ApiProperty({ description: 'Total number of tickets available' })
  @IsInt()
  @IsNotEmpty()
  totalTickets: number;

  @ApiProperty({ description: 'Score of the home team', required: false })
  @IsOptional()
  @IsInt()
  homeScore?: number;

  @ApiProperty({ description: 'Score of the away team', required: false })
  @IsOptional()
  @IsInt()
  awayScore?: number;
}
