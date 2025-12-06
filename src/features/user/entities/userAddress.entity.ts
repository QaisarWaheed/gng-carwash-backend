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

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: String })
  placeId?: string;

  @Prop({ type: String })
  formattedAddress?: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);

UserAddressSchema.index({ latitude: 1, longitude: 1 });

UserAddressSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.customerId) {
      ret.customerId = ret.customerId.toString();
    }
    return ret;
  },
});
