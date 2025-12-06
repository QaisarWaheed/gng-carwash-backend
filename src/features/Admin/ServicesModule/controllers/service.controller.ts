import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceService } from '../services/services.service';
import { CreateServiceDto } from '../dtos/CreateServiceDto';
import { UpdateServiceDto } from '../dtos/UpdateServiceDto';
import { Role } from 'src/types/enum.class';
import { Roles } from 'src/decorators/Roles.decorator';
import { AuthGuardWithRoles } from 'src/guards/authGuart';
import { ApiBearerAuth } from '@nestjs/swagger';

type MulterLikeFile = {
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
};

@Controller('service')
@ApiBearerAuth()
export class ServiceController {
  constructor(private readonly adminService: ServiceService) {}

  @Get('get-all-services')
  async getAllServices() {
    try {
      const services = await this.adminService.getAllServices();
      console.log('Returning services:', JSON.stringify(services, null, 2));
      return services;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    try {
      const service = await this.adminService.getServiceById(id);
      if (!service) {
        throw new NotFoundException(`Service with Id: ${id} not found`);
      }
      return service;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Post()
  async createNewService(@Body() data: CreateServiceDto) {
    try {
      return await this.adminService.addNewService(data);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Put(':id')
  async updateExisitngService(
    @Param('id') id: string,
    @Body() data: UpdateServiceDto,
  ) {
    try {
      return await this.adminService.updateService(id, data);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Delete(':id')
  async deleteExistingService(@Param('id') id: string) {
    try {
      return await this.adminService.deleteService(id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Post(':id/upload-image')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadServiceImage(
    @Param('id') id: string,
    @UploadedFile() file: MulterLikeFile,
  ) {
    try {
      return await this.adminService.uploadServiceImage(id, file);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
