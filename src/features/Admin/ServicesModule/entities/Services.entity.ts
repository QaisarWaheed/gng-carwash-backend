import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
export type VehicleType =
  | 'Sedan'
  | 'SUV'
  | 'Bike'
  | 'Caravan'
  | 'Buggy'
  | 'Jetski'
  | 'MPV'
  | 'Others';
export interface VehicleTypePrice {
  vehicleType: VehicleType;
  price: number;
}
@Schema({ timestamps: true })
export class AdminService {
  declare _id: mongoose.Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  estimatedTime: number;

  @Prop()
  image: string;

  @Prop()
  imageUrl: string;

  @Prop()
  cloudinaryPublicId: string;

  @Prop()
  isActive: boolean;

  @Prop()
  vehicleTypes: VehicleType[];

  @Prop()
  vehiclePricing?: VehicleTypePrice[];

  declare createdAt: Date;

  declare updatedAt: Date;
}

const adminServiceSchema = SchemaFactory.createForClass(AdminService);

adminServiceSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export default adminServiceSchema;
