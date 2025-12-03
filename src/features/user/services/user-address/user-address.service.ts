import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAddress, UserAddressDocument } from '../../entities/userAddress.entity';
import { CreateAddressDto } from '../../dto/user-address.dto';
import { UpdateAddressDto } from '../../dto/update-user-address.dto';


@Injectable()
export class UserAddressService {
  constructor(
    @InjectModel(UserAddress.name)
    private addressModel: Model<UserAddressDocument>,
  ) {}

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressModel.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const created = new this.addressModel({
      userId: new Types.ObjectId(userId),
      ...dto,
    });

    return created.save();
  }

  async findUserAddresses(userId: string) {
    return this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, updatedAt: -1 });  
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.addressModel.findOne({
      _id: id,
      userId,
    });

    if (!address) throw new NotFoundException('Address not found');

    
    if (dto.isDefault === true) {
      await this.addressModel.updateMany(
        { userId, _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(address, dto);
    return address.save();
  }

  async remove(userId: string, id: string) {
    const deleted = await this.addressModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) throw new NotFoundException('Address not found');

    return deleted;
  }

  async findOne(id: string) {
    return this.addressModel.findById(id);
  }
}
