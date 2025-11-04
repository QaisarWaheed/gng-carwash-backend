import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ default: 'hummad@gmail.com' })
  identifier: string;

  @ApiProperty({ default: 'hummad' })
  password: string;
}
