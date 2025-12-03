import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;


@Schema({ timestamps: true })
export class Booking {
  declare _id: mongoose.Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserAuth', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserAuth', default: null })
  assignedManagerId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'UserAuth', default: null })
  assignedEmployeeId: Types.ObjectId | null;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true })
  timeSlot: string;

  @Prop({ type: Types.ObjectId, ref: 'UserAddress', required: true })
  addressId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid',
  })
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';

  @Prop({
    isReviewed: { type: Boolean, default: false },
  })
  isReviewed: boolean;

  @Prop({
    type: String,
    enum: ['Card'],
    default: 'Card',
  })
  paymentMethod: 'Card';

  @Prop()
  beforeImage: string;

  @Prop()
  afterImage: string;

  @Prop({ type: String })
  cancellationReason?: string;

  @Prop({ type: Number, min: 1, max: 5 })
  rating?: number;

  @Prop({ type: String })
  review?: string;

  @Prop({ type: Number })
  subtotal?: number;

  @Prop({ type: Number })
  serviceCharge?: number;

  @Prop({ type: String, enum: ['sedan', 'suv', 'coupe', 'hatchback', 'truck'] })
  vehicleSubType?: 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'truck';

  @Prop({ type: [Types.ObjectId], ref: 'Service' })
  services?: Types.ObjectId[];

  @Prop({ type: String })
  additionalNotes?: string;
}

export const bookingSchema = SchemaFactory.createForClass(Booking);
