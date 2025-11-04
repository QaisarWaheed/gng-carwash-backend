/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ServiceModule } from './servicesModule/service.module';

@Module({
  controllers: [],
  imports: [ServiceModule]
})
export class AdminModule { }
