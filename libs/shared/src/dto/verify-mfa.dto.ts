import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyMfaDto {
  @ApiProperty({ description: 'The 6-digit TOTP token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
