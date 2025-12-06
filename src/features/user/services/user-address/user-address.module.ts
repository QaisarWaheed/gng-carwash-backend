import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserAddress,
  UserAddressSchema,
} from '../../entities/userAddress.entity';
import { UserAddressService } from './user-address.service';
import { UserAddressController } from './user-address.controller';
import { MapsModule } from '../maps/maps.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
    MapsModule,
  ],
  controllers: [UserAddressController],
  providers: [UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}
