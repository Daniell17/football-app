import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlayerPosition } from '@prisma/client';

export class CreatePlayerDto {
  @ApiProperty({ description: 'First name of the player' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the player' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Position on the field', enum: PlayerPosition })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiProperty({ description: 'Jersey number' })
  @IsInt()
  @IsNotEmpty()
  number: number;

  @ApiProperty({ description: 'Nationality', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ description: 'Date of birth', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ description: 'URL of the player photo', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Whether the player is currently active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
