/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import type { Roles } from '../entities/userAuth.entity';

export class UserAuthDto {
  @ApiProperty({ default: 'manager' })
  fullName: string;

  @ApiProperty({ default: 'manager@gmail.com' })
  email: string;

  @ApiProperty({ default: '12345678907' })
  phoneNumber: string;

  @ApiProperty({ default: 'manager' })
  password: string;

  @ApiProperty({ default: 'Manager' })
  role: Roles;
}
