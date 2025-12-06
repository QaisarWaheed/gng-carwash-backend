import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class forgotPasswordDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    identifier:string

}