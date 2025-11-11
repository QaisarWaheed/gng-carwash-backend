/* eslint-disable prettier/prettier */
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlagDto {
    @IsMongoId()
    @IsNotEmpty()
    bookingId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsMongoId()
    @IsNotEmpty()
    issuedBy: string;
}
