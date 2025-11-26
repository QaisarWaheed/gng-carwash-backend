import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateBookingDto } from './CreateBookingDto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiProperty()
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';



}
