/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ServiceModule } from './ServicesModule/service.module';

@Module({
  controllers: [],
  imports: [ServiceModule]
})
export class AdminModule { }
