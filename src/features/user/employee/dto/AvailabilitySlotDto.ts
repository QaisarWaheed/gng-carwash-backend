import { IsDateString, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilitySlotDto {
  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty()
  @IsString()
  timeSlot: string;

  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;
}

export class AddAvailabilitySlotsDto {
  @ApiProperty({ type: [CreateAvailabilitySlotDto] })
  @IsArray()
  slots: CreateAvailabilitySlotDto[];
}
