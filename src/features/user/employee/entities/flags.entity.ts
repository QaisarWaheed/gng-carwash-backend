/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

@Schema({ _id: false })
export class Flag {
    @Prop({ required: true })
    reason: string;

    @Prop({ required: true, default: Date.now })
    date: Date;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    issuedBy: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    resolved: boolean;

    @Prop()
    resolvedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    resolvedBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Booking' })
    bookingId?: Types.ObjectId; // optional but recommended
}

const flagSchema = SchemaFactory.createForClass(Flag)
export default flagSchema