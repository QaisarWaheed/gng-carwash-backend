import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { AddressType } from '../entities/userAddress.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  customerId?: string;

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

  @IsOptional()
  @ApiProperty({ required: false })
  latitude?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  longitude?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  placeId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  formattedAddress?: string;
}
