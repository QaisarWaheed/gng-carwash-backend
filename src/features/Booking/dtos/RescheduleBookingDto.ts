import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RescheduleBookingDto {
  @IsDateString()
  date: string;

  @IsString()
  timeSlot: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
