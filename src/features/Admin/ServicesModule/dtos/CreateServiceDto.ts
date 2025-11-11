/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger"
export type VehicleType = 'Sedan' | 'SUV' | 'Bike' | 'Carvan' | 'Buggy' | 'Jetski' | 'MPV' | 'Others';

export interface VehicleTypePrice {
    vehicleType: VehicleType;
    price: number;
}
export class CreateServiceDto {

    @ApiProperty()
    name: string

    @ApiProperty()
    description: string

    @ApiProperty()
    price: number

    @ApiProperty()
    estimatedTime: number

    @ApiProperty()
    vehicleTypes: VehicleType[];


    @ApiProperty()
    vehiclePricing?: VehicleTypePrice[];

    @ApiProperty()
    isActive: boolean

}