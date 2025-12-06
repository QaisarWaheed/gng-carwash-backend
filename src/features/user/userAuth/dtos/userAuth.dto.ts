import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from 'src/types/enum.class';

export class UserAuthDto {
  @ApiProperty({ default: 'manager' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ default: 'manager@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: '12345678907' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ default: 'manager' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ default: 'Manager' })
  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
