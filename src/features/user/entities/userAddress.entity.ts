import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type UserAddressDocument = HydratedDocument<UserAddress>;

export enum AddressType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class UserAddress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: String, enum: AddressType })
  type: AddressType;

  @Prop()
  label: string;

  @Prop()
  streetAddress: string;

  @Prop()
  building: string;

  @Prop()
  apartment: string;

  @Prop()
  area: string;

  @Prop()
  city: string;

  @Prop()
  emirate: string;

  @Prop()
  landmark: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  instructions: string;

  @Prop({ default: true })
  isDefault: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
