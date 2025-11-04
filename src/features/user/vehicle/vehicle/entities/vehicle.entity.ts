import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { ref } from "process";

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
    year: number

    @Prop()
    plateNumber: string

    @Prop()
    color: string

}

const vehicleSchema = SchemaFactory.createForClass(Vehicle)
export default vehicleSchema