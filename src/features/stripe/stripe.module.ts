import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeWebhookController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { BookingModule } from '../Booking/booking.module';


@Module({
  imports: [ConfigModule, BookingModule],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
