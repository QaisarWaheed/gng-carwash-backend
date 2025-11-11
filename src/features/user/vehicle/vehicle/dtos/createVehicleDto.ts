import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";
import type { VehicleSubType, VehicleType } from "../entities/vehicle.entity";

export class CreateVehicleDto {
    @ApiProperty({ type: Types.ObjectId })
    customerId: Types.ObjectId

    @ApiProperty()
    brand: string

    @ApiProperty()
    model: string

    @ApiProperty()
    type: VehicleType;

    @ApiProperty()
    subType?: VehicleSubType;

    @ApiProperty()
    make: string;

    @ApiProperty()
    year: number

    @ApiProperty()
    plateNumber: string

    @ApiProperty()
    plateCode: string;

    @ApiProperty()
    color: string

    @ApiProperty()
    city: string;

    @ApiProperty()
    photo?: string;

}
