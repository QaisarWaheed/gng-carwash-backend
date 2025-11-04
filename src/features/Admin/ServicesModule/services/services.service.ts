/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AdminService } from '../entities/Services.entity';
import { Model } from 'mongoose';
import { CreateServiceDto } from '../dtos/CreateServiceDto';
import { UpdateServiceDto } from '../dtos/UpdateServiceDto';

@Injectable()
export class ServiceService {

  constructor(@InjectModel('AdminService') private readonly adminServiceModel: Model<AdminService>) { }


  async addNewService(data: CreateServiceDto): Promise<AdminService> {
    const newService = await this.adminServiceModel.create(data)
    return newService
  }


  async getAllServices(): Promise<AdminService[] | null> {
    return await this.adminServiceModel.find()
  }

  async getServiceById(id: string): Promise<AdminService | null> {
    return await this.adminServiceModel.findById(id)
  }

  async updateService(id: string, data: UpdateServiceDto): Promise<AdminService | { message: string }> {
    const updatedService = await this.adminServiceModel.findByIdAndUpdate(id, data, { new: true })
    if (!updatedService) {
      return { message: "no service Found to Update" }
    }
    return updatedService
  }

  async deleteService(id: string): Promise<{ message: string }> {
    const deletedService = await this.adminServiceModel.findByIdAndDelete(id)
    if (!deletedService) {
      return { message: "No Service found" }
    }
    return { message: "service deleted!!!!" }

  }

}
