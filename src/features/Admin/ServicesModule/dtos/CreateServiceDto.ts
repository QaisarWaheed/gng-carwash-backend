import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';

export type VehicleType =
  | 'Sedan'
  | 'SUV'
  | 'Bike'
  | 'Carvan'
  | 'Buggy'
  | 'Jetski'
  | 'MPV'
  | 'Others';

export interface VehicleTypePrice {
  vehicleType: VehicleType;
  price: number;
}
export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  estimatedTime: number;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  vehicleTypes: VehicleType[];

  @ApiProperty()
  @IsOptional()
  vehiclePricing?: VehicleTypePrice[];

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
