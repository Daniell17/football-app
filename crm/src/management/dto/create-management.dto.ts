import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ManagementRole } from '@prisma/client';

export class CreateManagementDto {
  @ApiProperty({ description: 'Full name of the staff member' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Role of the staff member', enum: ManagementRole })
  @IsEnum(ManagementRole)
  role: ManagementRole;

  @ApiProperty({ description: 'URL of the staff photo', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: 'Short biography', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Whether the staff member is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
