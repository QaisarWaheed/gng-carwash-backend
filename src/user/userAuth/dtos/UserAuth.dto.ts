import { ApiProperty } from "@nestjs/swagger";
import type { Roles } from "../entities/userAuth.entity";

export class UserAuthDto{
    @ApiProperty()
    fullName:string

    @ApiProperty()
    email:string

    @ApiProperty()
    phoneNumber:string

    @ApiProperty()
    password:string

    @ApiProperty()
    roles:Roles
}