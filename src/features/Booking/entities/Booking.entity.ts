import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {

  declare _id: mongoose.Types.ObjectId


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

  @Prop({
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    required: true,
    _id: false
  })
  location: {
    lat: number;
    lng: number;
    address: string;
  };

  @Prop({
    type: String,
    enum: ['Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Pending',
  })
  status: 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled';

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
  beforeImage: string

  @Prop()
  afterImage: string


}

export const bookingSchema = SchemaFactory.createForClass(Booking);
