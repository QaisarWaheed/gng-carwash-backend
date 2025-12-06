import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class MakeBookingPayment {
  @ApiProperty()
  customerId: string;

  @ApiProperty({
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid',
  })
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';

  @ApiProperty({
    type: String,
    enum: ['Card'],
    default: 'Card',
  })
  paymentMethod: 'Card';

  @ApiProperty()
  amount: number;
}
