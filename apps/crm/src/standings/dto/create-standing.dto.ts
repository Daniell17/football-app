import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStandingDto {
  @ApiProperty({ description: 'Name of the team' })
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty({ description: 'Games played', default: 0 })
  @IsOptional()
  @IsInt()
  played?: number;

  @ApiProperty({ description: 'Wins', default: 0 })
  @IsOptional()
  @IsInt()
  wins?: number;

  @ApiProperty({ description: 'Draws', default: 0 })
  @IsOptional()
  @IsInt()
  draws?: number;

  @ApiProperty({ description: 'Losses', default: 0 })
  @IsOptional()
  @IsInt()
  losses?: number;

  @ApiProperty({ description: 'Goals for', default: 0 })
  @IsOptional()
  @IsInt()
  goalsFor?: number;

  @ApiProperty({ description: 'Goals against', default: 0 })
  @IsOptional()
  @IsInt()
  goalsAgainst?: number;

  @ApiProperty({ description: 'Total points', default: 0 })
  @IsOptional()
  @IsInt()
  points?: number;
}
