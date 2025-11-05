/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import flagSchema, { Flag } from "./flags.entity";

@Schema({ timestamps: true })
export class Employee extends Document {

    @Prop({ type: Types.ObjectId, ref: 'UserAuth', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    completedJobs: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Booking' }] })
    assignedBookings: Types.ObjectId[];



    @Prop({
        type: [
            {
                bookingId: { type: Types.ObjectId, ref: 'Booking' },
                rating: { type: Number, min: 1, max: 5 },
                review: { type: String },
            },
        ],
    })
    reviews: {
        bookingId: Types.ObjectId;
        rating: number;
        review: string;
    }[];

    @Prop({ type: [flagSchema], default: [] })
    flags: Flag[];




}

const employeeSchema = SchemaFactory.createForClass(Employee)
export default employeeSchema