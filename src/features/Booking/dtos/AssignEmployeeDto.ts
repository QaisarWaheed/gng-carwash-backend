import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class AssignEmployeeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assignedEmployeeId: string


}
