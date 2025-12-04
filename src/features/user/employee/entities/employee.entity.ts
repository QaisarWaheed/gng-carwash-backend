/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import flagSchema, { Flag } from "./flags.entity";

export interface AvailabilitySlot {
  date: Date;
  timeSlot: string;
  isAvailable: boolean;
}

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
                date: { type: Date, required: true },
                timeSlot: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
            },
        ],
        default: [],
    })
    availabilitySlots: AvailabilitySlot[];

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