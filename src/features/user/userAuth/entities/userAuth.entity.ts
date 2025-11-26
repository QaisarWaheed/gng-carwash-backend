/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type Roles = 'User' | 'Admin' | 'Employee' | 'Manager';

@Schema({ timestamps: true })
export class UserAuth {
  declare _id: mongoose.Types.ObjectId;

  @Prop()
  fullName: string;

  @Prop()
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop({
    type: String,
    enum: ['User', 'Admin', 'Employee', 'Manager'],
    default: 'User',
  })
  role: Roles;



  @Prop({ type: String, required: false })
  otp?: string;

  @Prop({ type: Date, required: false })
  otpExpiresAt?: Date;

  @Prop({ type: String, required: false })
  googleId?: string;

  @Prop({ type: String, required: false })
  avatar?: string;

  @Prop({ type: Boolean, default: false })
  isVerified?: boolean;

  declare createAt: Date;
  declare updatedAt: Date;
}

const userAuthSchema = SchemaFactory.createForClass(UserAuth);
export default userAuthSchema;
