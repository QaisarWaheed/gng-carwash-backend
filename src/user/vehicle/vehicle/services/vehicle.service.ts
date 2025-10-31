import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateVehicleDto } from '../dtos/createVehicleDto';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehicleService {
    constructor(
        @InjectModel(Vehicle.name)
        private readonly vehicleModel: Model<Vehicle>,
    ) { }

    async createVehicle(dto: CreateVehicleDto) {
        try {
            const exists = await this.vehicleModel.findOne({ plateNumber: dto.plateNumber });
            if (exists) throw new BadRequestException('Vehicle with this plate number already exists');

            const vehicle = await this.vehicleModel.create({
                ...dto,
                userId: new Types.ObjectId(dto.userId),
            });

            return { message: 'Vehicle created successfully', vehicle };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    async getAllVehicles() {
        const vehicles = await this.vehicleModel.find().populate('userId', 'name email');
        return vehicles;
    }

    async getVehiclesByUser(userId: string) {
        const vehicles = await this.vehicleModel.find({ userId: new Types.ObjectId(userId) });
        return vehicles;
    }

    async getVehicleById(id: string) {
        const vehicle = await this.vehicleModel.findById(id).populate('userId', 'name email');
        if (!vehicle) throw new NotFoundException('Vehicle not found');
        return vehicle;
    }

    async updateVehicle(id: string, dto: Partial<CreateVehicleDto>) {
        const updated = await this.vehicleModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated) throw new NotFoundException('Vehicle not found');
        return { message: 'Vehicle updated successfully', updated };
    }

    async deleteVehicle(id: string) {
        const deleted = await this.vehicleModel.findByIdAndDelete(id);
        if (!deleted) throw new NotFoundException('Vehicle not found');
        return { message: 'Vehicle deleted successfully' };
    }
}
