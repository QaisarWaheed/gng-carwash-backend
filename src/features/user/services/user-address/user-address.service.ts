import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAddress, UserAddressDocument } from '../../entities/userAddress.entity';
import { CreateAddressDto } from '../../dto/user-address.dto';
import { UpdateAddressDto } from '../../dto/update-user-address.dto';
import { GoogleMapsService } from '../maps/google-maps.service';


@Injectable()
export class UserAddressService {
  private readonly logger = new Logger(UserAddressService.name);

  constructor(
    @InjectModel(UserAddress.name)
    private addressModel: Model<UserAddressDocument>,
    private googleMapsService: GoogleMapsService,
  ) {}

  async create(userId: string, dto: CreateAddressDto) {
    console.log('UserAddressService.create - userId:', userId, 'dto:', JSON.stringify(dto));
    
 
    if (dto.type === 'OTHER' && (!dto.label || !dto.label.trim())) {
      throw new BadRequestException('Label is required when address type is OTHER');
    }
    
    if (!dto.latitude || !dto.longitude) {
      const addressString = this.buildAddressString(dto);
      
      try {
        const geoData = await this.googleMapsService.geocodeAddress(addressString);
        dto.latitude = geoData.latitude;
        dto.longitude = geoData.longitude;
        dto.placeId = geoData.placeId;
        dto.formattedAddress = geoData.formattedAddress;

        const isWithinArea = await this.googleMapsService.isWithinServiceArea(
          geoData.latitude,
          geoData.longitude,
        );

        if (!isWithinArea) {
          throw new BadRequestException(
            'This address is outside our service area. We currently only serve Dubai.',
          );
        }

        this.logger.log(`Address geocoded successfully: ${geoData.formattedAddress}`);
      } catch (error) {
        this.logger.warn(`Failed to geocode address: ${error.message}`);
        
        if (error instanceof BadRequestException) {
          throw error;
        }
        
        this.logger.warn('Proceeding without coordinates');
      }
    } else {
      try {
        const isWithinArea = await this.googleMapsService.isWithinServiceArea(
          dto.latitude,
          dto.longitude,
        );

        if (!isWithinArea) {
          throw new BadRequestException(
            'This location is outside our service area. We currently only serve Dubai.',
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        this.logger.warn(`Service area validation failed: ${error.message}`);
      }
    }

    if (dto.isDefault) {
      await this.addressModel.updateMany(
        { customerId: userId, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const created = new this.addressModel({
      customerId: userId,
      ...dto,
    });

    const saved = await created.save();
    this.logger.log(`Address saved with customerId: ${saved.customerId} (type: ${typeof saved.customerId})`);
    return saved;
  }

  private buildAddressString(dto: Partial<CreateAddressDto | UpdateAddressDto>): string {
    const parts: string[] = [];
    
    if (dto.building) parts.push(dto.building);
    if (dto.apartment) parts.push(`Apt ${dto.apartment}`);
    if (dto.streetAddress) parts.push(dto.streetAddress);
    if (dto.area) parts.push(dto.area);
    if (dto.city) parts.push(dto.city);
    if (dto.emirate) parts.push(dto.emirate);
    
    return parts.filter(Boolean).join(', ');
  }

  async findUserAddresses(userId: string) {
    if (!userId) {
      this.logger.warn('findUserAddresses called with no userId');
      return [];
    }
    
    this.logger.log(`Searching addresses for userId: ${userId}`);
    
    
    const addresses = await this.addressModel
      .find({ customerId: userId })
      .sort({ isDefault: -1, updatedAt: -1 });
    
    this.logger.log(`Found ${addresses.length} addresses for user ${userId}`);
    
    return addresses;
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.addressModel.findOne({
      _id: id,
      customerId: userId,
    });

    if (!address) throw new NotFoundException('Address not found');


    const finalType = dto.type || address.type;
    if (finalType === 'OTHER') {
      const finalLabel = dto.label !== undefined ? dto.label : address.label;
      if (!finalLabel || !finalLabel.trim()) {
        throw new BadRequestException('Label is required when address type is OTHER');
      }
    }

    const addressFieldsChanged = 
      dto.streetAddress || dto.area || dto.city || dto.emirate || 
      dto.building || dto.apartment;

    if (addressFieldsChanged && !dto.latitude && !dto.longitude) {
      const existingAddress = address.toObject();
      const mergedData = {
        streetAddress: dto.streetAddress || existingAddress.streetAddress,
        area: dto.area || existingAddress.area,
        city: dto.city || existingAddress.city,
        emirate: dto.emirate || existingAddress.emirate,
        building: dto.building || existingAddress.building,
        apartment: dto.apartment || existingAddress.apartment,
      };
      const addressString = this.buildAddressString(mergedData);
      
      try {
        const geoData = await this.googleMapsService.geocodeAddress(addressString);
        dto.latitude = geoData.latitude;
        dto.longitude = geoData.longitude;
        dto.placeId = geoData.placeId;
        dto.formattedAddress = geoData.formattedAddress;

      
        const isWithinArea = await this.googleMapsService.isWithinServiceArea(
          geoData.latitude,
          geoData.longitude,
        );

        if (!isWithinArea) {
          throw new BadRequestException(
            'Updated address is outside our service area.',
          );
        }

        this.logger.log(`Address re-geocoded: ${geoData.formattedAddress}`);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        this.logger.warn(`Failed to re-geocode address: ${error.message}`);
      }
    }

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
    const address = await this.addressModel.findOneAndDelete({
      _id: id,
      customerId: userId,
    });

    if (!address) throw new NotFoundException('Address not found');

    return address;
  }

  async findOne(id: string) {
    return this.addressModel.findById(id);
  }
}
