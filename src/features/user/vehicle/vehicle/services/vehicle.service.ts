import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateVehicleDto } from '../dtos/createVehicleDto';
import { Vehicle } from '../entities/vehicle.entity';
import { CloudinaryService } from 'src/features/cloudinary/cloudinary.service';

@Injectable()
export class VehicleService {
    constructor(
        @InjectModel(Vehicle.name)
        private readonly vehicleModel: Model<Vehicle>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async createVehicle(dto: CreateVehicleDto) {
        try {
            const exists = await this.vehicleModel.findOne({ plateNumber: dto.plateNumber });
            if (exists) throw new BadRequestException('Vehicle with this plate number already exists');

            const vehicle = await this.vehicleModel.create({
                ...dto,
                customerId: new Types.ObjectId(dto.customerId),
            });

            const vehicleObj = vehicle.toObject();
            return { message: 'Vehicle created successfully', vehicle: { ...vehicleObj, id: vehicleObj._id.toString() } };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    async getAllVehicles() {
        const vehicles = await this.vehicleModel.find().populate('customerId', 'fullName email');
        return vehicles.map(v => {
            const obj = v.toObject();
            return { ...obj, id: obj._id.toString() };
        });
    }

    async getVehiclesByUser(userId: string) {
        const vehicles = await this.vehicleModel.find({ customerId: new Types.ObjectId(userId) });
        return vehicles.map(v => {
            const obj = v.toObject();
            return { ...obj, id: obj._id.toString() };
        });
    }

    async getVehicleById(id: string) {
        const vehicle = await this.vehicleModel.findById(id).populate('customerId', 'fullName email');
        if (!vehicle) throw new NotFoundException('Vehicle not found');
        const obj = vehicle.toObject();
        return { ...obj, id: obj._id.toString() };
    }

    async updateVehicle(id: string, dto: Partial<CreateVehicleDto>) {
        const updated = await this.vehicleModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated) throw new NotFoundException('Vehicle not found');
        const obj = updated.toObject();
        return { message: 'Vehicle updated successfully', updated: { ...obj, id: obj._id.toString() } };
    }

    async deleteVehicle(id: string) {
        const deleted = await this.vehicleModel.findByIdAndDelete(id);
        if (!deleted) throw new NotFoundException('Vehicle not found');
        return { message: 'Vehicle deleted successfully' };
    }

    async setDefaultVehicle(id: string) {
        const vehicle = await this.vehicleModel.findById(id);
        if (!vehicle) throw new NotFoundException('Vehicle not found');

        await this.vehicleModel.updateMany(
            { customerId: vehicle.customerId },
            { $set: { isDefault: false } }
        );

        const updated = await this.vehicleModel.findByIdAndUpdate(
            id,
            { $set: { isDefault: true } },
            { new: true }
        );

        if (!updated) throw new NotFoundException('Vehicle not found');
        const obj = updated.toObject();
        return { message: 'Default vehicle set successfully', vehicle: { ...obj, id: obj._id.toString() } };
    }

    async uploadVehiclePhoto(id: string, file: any) {
        const vehicle = await this.vehicleModel.findById(id);
        if (!vehicle) throw new NotFoundException('Vehicle not found');

        // Upload image to Cloudinary
        const result = await this.cloudinaryService.uploadImage(file, 'vehicles');

        const updated = await this.vehicleModel.findByIdAndUpdate(
            id,
            { $set: { photo: result.secure_url, cloudinaryPublicId: result.public_id } },
            { new: true }
        );

        if (!updated) throw new NotFoundException('Vehicle not found');
        const obj = updated.toObject();
        return { photoUrl: result.secure_url, vehicle: { ...obj, id: obj._id.toString() } };
    }
}
