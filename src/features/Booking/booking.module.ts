import { Module } from '@nestjs/common';
import { BookingController } from './controllers/bookingcontroller/bookingcontroller.controller';
import { BookingServiceService } from './booking-service/booking-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, bookingSchema } from './entities/Booking.entity';
import userAuthSchema from 'src/user/userAuth/entities/userAuth.entity';
import employeeSchema from 'src/user/employee/entities/Employeet.entity';
import { UserAuthService } from 'src/user/userAuth/services/userAuth.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: bookingSchema }, { name: 'UserAuth', schema: userAuthSchema }, { name: 'Employee', schema: employeeSchema }])],
  controllers: [BookingController],
  providers: [BookingServiceService, UserAuthService]
})
export class BookingModule { }
