import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";


export type VehicleType = 'car' | 'bike' | 'jetski' | 'buggy' | 'caravan' | 'mpv' | 'other';

export type VehicleSubType = 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'truck';


@Schema({ timestamps: true })
export class Vehicle {
    declare _id: mongoose.Types.ObjectId


    @Prop({ type: Types.ObjectId, ref: "UserAuth" })
    customerId: Types.ObjectId

    @Prop()
    brand: string

    @Prop()
    model: string


    @Prop()
    type: VehicleType;

    @Prop()
    subType?: VehicleSubType;

    @Prop()
    make: string;


    @Prop()
    year: number

    @Prop()
    plateNumber: string

    @Prop()
    plateCode: string;


    @Prop()
    color: string



    @Prop()
    city: string;

    @Prop()
    photo?: string;


}

const vehicleSchema = SchemaFactory.createForClass(Vehicle)
export default vehicleSchema