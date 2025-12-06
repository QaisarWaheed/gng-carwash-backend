import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'hummad@gmail.com' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ default: 'hummad' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
