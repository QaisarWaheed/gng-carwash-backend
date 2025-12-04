import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({
    type: String,
    enum: ['signup', 'password-reset', 'email-change'],
    required: true,
  })
  purpose: 'signup' | 'password-reset' | 'email-change';

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
