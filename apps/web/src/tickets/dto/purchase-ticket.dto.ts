import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseTicketDto {
  @ApiProperty({ description: 'The ID of the match' })
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @ApiProperty({ description: 'Number of tickets to purchase', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
