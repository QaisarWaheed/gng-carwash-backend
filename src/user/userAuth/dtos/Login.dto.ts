import { ApiProperty } from "@nestjs/swagger";

export class LoginDto{
    @ApiProperty()
    identifier: string

    @ApiProperty()
    password:string
}