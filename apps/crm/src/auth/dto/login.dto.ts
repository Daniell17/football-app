import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'The email of the user', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
