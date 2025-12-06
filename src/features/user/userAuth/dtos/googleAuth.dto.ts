import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GoogleUserInfoDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty()
  @IsString()
  sub: string;
}

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  googleToken: string;

  @ApiProperty({ type: GoogleUserInfoDto })
  userInfo: GoogleUserInfoDto;
}
