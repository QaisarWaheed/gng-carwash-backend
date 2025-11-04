import { ApiProperty } from "@nestjs/swagger";

export class forgotPasswordDto{
    @ApiProperty()
    identifier:string

}