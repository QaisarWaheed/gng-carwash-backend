import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AdminModule } from './features/Admin/admin.module';
import { BookingModule } from './features/Booking/booking.module';
import { UserAuthModule } from './features/user/userAuth/userAuth.module';
import { VehicleModule } from './features/user/vehicle/vehicle/vehicle.module';
import { UserAddressModule } from './features/user/services/user-address/user-address.module';
import { StripeModule } from './features/stripe/stripe.module';
import { NotificationsModule } from './features/notifications/notifications.module';

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
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    UserAuthModule,
    VehicleModule,
    AdminModule,
    BookingModule,
    UserAddressModule,
    StripeModule,
    NotificationsModule,
  ],
})
export class AppModule {}
