import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import type { VehicleSubType, VehicleType } from "../entities/vehicle.entity";

export class CreateVehicleDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    customerId?: string

    @ApiProperty()
    @IsString()
    model: string

    @ApiProperty()
    @IsString()
    type: VehicleType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    subType?: VehicleSubType;

    @ApiProperty()
    @IsString()
    make: string;

    @ApiProperty()
    @IsNumber()
    year: number

    @ApiProperty()
    @IsString()
    plateNumber: string

    @ApiProperty()
    @IsString()
    plateCode: string;

    @ApiProperty()
    @IsString()
    color: string

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    photo?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

}
