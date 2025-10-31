import { Module } from '@nestjs/common';
import { BookingcontrollerController } from './controllers/bookingcontroller/bookingcontroller.controller';
import { BookingServiceService } from './booking-service/booking-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { bookingSchema } from './entities/Booking.entity';

@Module({
  imports:[MongooseModule.forFeature([{name:'Booking', schema:bookingSchema}])],
  controllers: [BookingcontrollerController],
  providers:[BookingServiceService]
})
export class BookingModule {}
