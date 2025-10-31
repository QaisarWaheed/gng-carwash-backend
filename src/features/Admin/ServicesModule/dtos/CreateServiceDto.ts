import { ApiProperty } from "@nestjs/swagger"

export class CreateServiceDto{
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