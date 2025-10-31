import { ApiProperty } from "@nestjs/swagger";

export class UpdateBookingStatus {
    @ApiProperty()
    bookingId: string

    @ApiProperty({
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded'],
        default: 'Unpaid',
    })
    paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';

    @ApiProperty({
        type: String,
        enum: ['Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Pending',
    })
    status: 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled';

}