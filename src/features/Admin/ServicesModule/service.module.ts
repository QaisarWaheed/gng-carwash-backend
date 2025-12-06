import { Module } from '@nestjs/common';
import { ServiceController } from './controllers/service.controller';
import { ServiceService } from './services/services.service';
import { AdminReportController } from './controllers/admin-report.controller';
import { AdminReportService } from './services/admin-report.service';
import { MongooseModule } from '@nestjs/mongoose';
import adminServiceSchema from './entities/Services.entity';
import { BookingModule } from '../../Booking/booking.module';
import { BookingServiceService } from '../../Booking/booking-service/booking-service.service';

@Module({
  imports:[
    MongooseModule.forFeature([{name:'AdminService', schema:adminServiceSchema}]),
    BookingModule
  ],
  controllers: [ServiceController, AdminReportController],
  providers: [ServiceService, AdminReportService, BookingServiceService]
})
export class ServiceModule {}
