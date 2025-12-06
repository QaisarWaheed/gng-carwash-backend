import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  EMPLOYEE_ASSIGNED = 'EMPLOYEE_ASSIGNED',
  JOB_ASSIGNED = 'JOB_ASSIGNED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  MESSAGE = 'MESSAGE',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
