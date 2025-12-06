import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingStatus {
  @ApiProperty()
  bookingId: string;

  @ApiProperty({
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid',
  })
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';

  @ApiProperty({
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
}
