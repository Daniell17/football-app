import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ description: 'Name of the sender' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email of the sender' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Subject of the message', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'The message content' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
