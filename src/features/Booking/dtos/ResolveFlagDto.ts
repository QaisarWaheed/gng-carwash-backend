import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class ResolveFlagDto {
  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  resolvedBy?: string;

  @ApiProperty()
  @IsBoolean()
  resolved: boolean;

  @ApiProperty()
  resolvedAt?: Date;
}
