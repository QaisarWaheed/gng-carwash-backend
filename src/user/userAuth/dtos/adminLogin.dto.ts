import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty()
  adminEmail: string;

  @ApiProperty()
  adminPassword: string;
}
