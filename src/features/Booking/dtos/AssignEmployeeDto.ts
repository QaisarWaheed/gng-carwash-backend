import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class AssignEmployeeDto {
    @ApiProperty()
    assignedEmployeeId: string


}
