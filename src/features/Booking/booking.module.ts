import { Module } from '@nestjs/common';
import { BookingController } from './controllers/bookingcontroller/bookingcontroller.controller';
import { BookingServiceService } from './booking-service/booking-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, bookingSchema } from './entities/Booking.entity';
import employeeSchema from '../user/employee/entities/employee.entity';
import userAuthSchema from '../user/userAuth/entities/userAuth.entity';
import { UserAuthModule } from '../user/userAuth/userAuth.module';
import adminServiceSchema from '../Admin/ServicesModule/entities/Services.entity';
import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: bookingSchema }, 
      { name: 'UserAuth', schema: userAuthSchema }, 
      { name: 'Employee', schema: employeeSchema },
      { name: 'AdminService', schema: adminServiceSchema }
    ]),
    UserAuthModule,
    NotificationsModule
  ],
  controllers: [BookingController],
  providers: [BookingServiceService],
  exports: [BookingServiceService]
})
export class BookingModule { }
