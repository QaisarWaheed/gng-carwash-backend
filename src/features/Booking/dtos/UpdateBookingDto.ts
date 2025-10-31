import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateBookingDto } from './CreateBookingDto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiProperty()
  @IsOptional()
  @IsEnum(['Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled'])
  status?: 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled';



}
