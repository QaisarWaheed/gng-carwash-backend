import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({timestamps:true})
export class User{

declare _id:mongoose.Types.ObjectId;

@Prop()
fullName:string

@Prop()
lastName:string


@Prop()
email:string

@Prop()
phoneNumber:string

@Prop()
password:string

}