import { IsString, IsEnum, IsOptional, IsBoolean, IsNotEmpty, IsMongoId } from 'class-validator';
import { AddressType } from '../entities/userAddress.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    customerId: string;
    
  @IsEnum(AddressType)
  @ApiProperty()
  type: AddressType;

  @IsOptional()
  @IsString()
  @ApiProperty()
  label?: string;

  @IsString()
  @ApiProperty()
  streetAddress: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  building?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()

  apartment?: string;

  @IsString()
  @ApiProperty()

  area: string;

  @IsString()
  @ApiProperty()

  city: string;

  @IsString()
  @ApiProperty()

  emirate: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  landmark?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  instructions?: string;

  @IsBoolean()
  isDefault: boolean;
}
