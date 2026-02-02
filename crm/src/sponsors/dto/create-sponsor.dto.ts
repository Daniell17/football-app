import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SponsorTier } from '@prisma/client';

export class CreateSponsorDto {
  @ApiProperty({ description: 'Name of the sponsor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL of the sponsor logo' })
  @IsUrl()
  @IsNotEmpty()
  logoUrl: string;

  @ApiProperty({ description: 'Sponsor website URL', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Tier of the sponsorship', enum: SponsorTier })
  @IsEnum(SponsorTier)
  tier: SponsorTier;

  @ApiProperty({ description: 'Whether the sponsor is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
