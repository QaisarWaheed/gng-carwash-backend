import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsMongoId,
  ValidateNested,
  IsDateString,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidBookingDate } from '../validators/booking-date.validator';
import { IsValidTimeSlot } from '../validators/time-slot.validator';

 

export class CreateBookingDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  @Validate(IsValidBookingDate)
  date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTimeSlot)
  timeSlot: string;


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  addressId: string; 

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleSubType?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['Unpaid', 'Paid', 'Refunded'])
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tip?: number;
}
