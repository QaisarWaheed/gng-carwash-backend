import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class AssignEmployeeDto {
    @ApiProperty()
    assignedEmployeeId: string

    @ApiProperty()
    bookingId: string

    @ApiProperty()
    assignedAt: Date

    @ApiProperty({
        type: String,
        enum: ['Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Pending',
    })
    status: 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled';

    notes: string
}
