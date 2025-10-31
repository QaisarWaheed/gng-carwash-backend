import { ApiProperty } from "@nestjs/swagger";

export class UpdateServiceDto{
@ApiProperty()
name:string

@ApiProperty()
description:string

@ApiProperty()
price:number

@ApiProperty()
estimatedTime:number

@ApiProperty()
isActive:boolean

}