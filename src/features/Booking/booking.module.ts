import { Module } from '@nestjs/common';
import { BookingController } from './controllers/bookingcontroller/bookingcontroller.controller';
import { BookingServiceService } from './booking-service/booking-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, bookingSchema } from './entities/booking.entity';
import { UserAuthService } from '../user/userAuth/services/userAuth.service';
import employeeSchema from '../user/employee/entities/employee.entity';
import userAuthSchema from '../user/userAuth/entities/userAuth.entity';


@Module({
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: bookingSchema }, { name: 'UserAuth', schema: userAuthSchema }, { name: 'Employee', schema: employeeSchema }])],
  controllers: [BookingController],
  providers: [BookingServiceService, UserAuthService]
})
export class BookingModule { }
