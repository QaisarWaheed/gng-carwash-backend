import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsMongoId,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

 

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
  date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  timeSlot: string;


  @ApiProperty()
 @IsNotEmpty()
  @IsString()
  addressId: string; 

  @ApiProperty()
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

  // @ApiProperty()
  // @IsNumber()
  // @IsNotEmpty()
  // totalPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['Unpaid', 'Paid', 'Refunded'])
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';
}
