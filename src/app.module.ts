/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from './features/Admin/admin.module';
import { BookingModule } from './features/Booking/booking.module';
import { UserAuthModule } from './features/user/userAuth/userAuth.module';
import { VehicleModule } from './features/user/vehicle/vehicle/vehicle.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    UserAuthModule, VehicleModule, AdminModule, BookingModule,
    MongooseModule.forRoot('mongodb://localhost/gng-carwash'),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
