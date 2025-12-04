import {
  Controller,
  Post,
  Get,
  Headers,
  Req,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BookingServiceService } from '../Booking/booking-service/booking-service.service';
import { StripeService } from './stripe.service';

interface RawBodyRequest extends Request {
  rawBody?: Buffer | string;
}

@Controller('stripe')
export class StripeWebhookController {
  constructor(
    private bookingService: BookingServiceService,
    private configService: ConfigService,
    private stripeService: StripeService,
  ) {}

  @Post('payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency?: string },
  ) {
    return this.stripeService.createPaymentIntent(
      body.amount,
      body.currency || 'usd',
    );
  }

  @Get('payment-intent/:id')
  async retrievePaymentIntent(@Param('id') id: string) {
    return this.stripeService.retrievePaymentIntent(id);
  }

  @Post('confirm-payment')
  async confirmPayment(@Body() body: { paymentIntentId: string }) {
    return this.stripeService.confirmPayment(body.paymentIntentId);
  }

  @Post('customer')
  async createCustomer(@Body() body: { email: string; name?: string }) {
    return this.stripeService.createCustomer(body.email, body.name);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!secretKey) {
      throw new BadRequestException('Stripe secret key not configured');
    }

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });

    let event;
    const rawBody = req.rawBody || '';

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.log('⚠️ Webhook signature verification failed.', err.message);
      throw new BadRequestException('Invalid signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      // Update booking payment status
      await this.bookingService.makePayment(intent.metadata?.bookingId || intent.id, {
        customerId: intent.metadata?.customerId || '',
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        amount: (intent.amount || 0) / 100, // Convert from cents to dollars
      });
    }

    return { received: true };
  }
}
