import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";
@Schema({ timestamps: true })
export class AdminService {

    declare _id: mongoose.Types.ObjectId


    @Prop()
    name: string


    @Prop()
    description: string


    @Prop()
    price: number


    @Prop()
    estimatedTime: number

    @Prop()
    isActive: boolean


    declare createdAt: Date

    declare updatedAt: Date

}

const adminServiceSchema = SchemaFactory.createForClass(AdminService)

export default adminServiceSchema