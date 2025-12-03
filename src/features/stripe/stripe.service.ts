import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  async createCustomer(user) {
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });

    return customer.id;
  }

  async createPaymentIntent(amount: number, customerId: string) {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100,  
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });
  }
}
