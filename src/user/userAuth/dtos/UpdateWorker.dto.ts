import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkerDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  password: string;
}
