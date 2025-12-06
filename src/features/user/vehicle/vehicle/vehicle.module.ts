import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import vehicleSchema, { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './services/vehicle.service';
import { VehicleController } from './controllers/vehicle.controller';
import { CloudinaryModule } from 'src/features/cloudinary/cloudinary.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vehicle.name, schema: vehicleSchema }]),
        CloudinaryModule,
    ],
    providers: [VehicleService],
    controllers: [VehicleController]
})
export class VehicleModule { }
