import { Module } from '@nestjs/common';
import { ServiceController } from './controllers/service.controller';
import { ServiceService } from './services/services.service';
import { MongooseModule } from '@nestjs/mongoose';
import adminServiceSchema from './entities/Services.entity';

@Module({
  imports:[MongooseModule.forFeature([{name:'AdminService', schema:adminServiceSchema}])],
  controllers: [ServiceController],
  providers: [ServiceService]
})
export class ServiceModule {}
