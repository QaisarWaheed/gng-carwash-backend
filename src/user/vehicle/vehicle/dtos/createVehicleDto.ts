import { ApiProperty } from "@nestjs/swagger";

export class CreateVehicleDto {
    @ApiProperty()
    userId: string

    @ApiProperty()
    brand: string

    @ApiProperty()
    model: string

    @ApiProperty()
    year: number

    @ApiProperty()
    plateNumber: string

    @ApiProperty()
    color: string

}
