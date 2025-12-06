import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: Date;
}
