import {
  Controller,
  Post,
  Headers,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import Stripe from 'stripe';
import { BookingServiceService } from '../Booking/booking-service/booking-service.service';

@Controller('stripe')
export class StripeWebhookController {
  constructor(private bookingService: BookingServiceService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.log('⚠️ Webhook signature verification failed.', err.message);
      return;
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;

      await this.bookingService.markPaymentPaid(intent.id);
    }

    return { received: true };
  }
}
