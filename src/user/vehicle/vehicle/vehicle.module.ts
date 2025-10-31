import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import vehicleSchema, { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './services/vehicle.service';
import { VehicleController } from './controllers/vehicle.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Vehicle.name, schema: vehicleSchema }])],
    providers: [VehicleService],
    controllers: [VehicleController]
})
export class VehicleModule { }
