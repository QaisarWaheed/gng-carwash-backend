import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class MakeBookingPayment {
    @ApiProperty()
    bookingId: string

    @ApiProperty()
    customerId: string

    @ApiProperty({
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded'],
        default: 'Unpaid',
    })
    paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';


    @ApiProperty({
        type: String,
        enum: ['Cash', 'Card'],
        default: 'Cash',
    })
    paymentMethod: 'Cash' | 'Card';


    @ApiProperty()
    amount: number

    @ApiProperty()
    @IsOptional()
    transactionId?: string
}