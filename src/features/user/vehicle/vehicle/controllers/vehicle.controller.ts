import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehicleService } from '../services/vehicle.service';
import { AuthGuardWithRoles } from 'src/guards/authGuart';
import { VerifiedUserGuard } from 'src/guards/verifiedUser.guard';
import { Roles } from 'src/decorators/Roles.decorator';
import { Role } from 'src/types/enum.class';
import { CreateVehicleDto } from '../dtos/createVehicleDto';

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

interface UploadPhotoResponse {
  photoUrl: string;
  vehicle: {
    id: string;
    _id: any;
    customerId: any;
    model: string;
    type: any;
    subType?: any;
    make: string;
    year: number;
    plateNumber: string;
    plateCode: string;
    color: string;
    city: string;
    photo?: string;
    cloudinaryPublicId?: string;
    isDefault?: boolean;
    __v: number;
  };
}

@Controller('vehicles')
@UseGuards(AuthGuardWithRoles)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Roles(Role.User)
  @Post()
  @UseGuards(VerifiedUserGuard)
  async createVehicle(@Body() dto: CreateVehicleDto): Promise<any> {
    const res = await this.vehicleService.createVehicle(dto);
    return res as any;
  }

  @Roles(Role.Admin)
  @Roles(Role.User)
  @Get()
  async getAllVehicles(): Promise<any> {
    const res = await this.vehicleService.getAllVehicles();
    return res as any;
  }

  @Roles(Role.User)
  @Get('user/:userId')
  async getUserVehicles(@Param('userId') userId: string): Promise<any> {
    const res = await this.vehicleService.getVehiclesByUser(userId);
    return res as any;
  }

  @Roles(Role.User)
  @Get(':id')
  async getVehicle(@Param('id') id: string): Promise<any> {
    const res = await this.vehicleService.getVehicleById(id);
    return res as any;
  }

  @Roles(Role.User)
  @Put(':id')
  @UseGuards(VerifiedUserGuard)
  async updateVehicle(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleDto>,
  ): Promise<any> {
    const res = await this.vehicleService.updateVehicle(id, dto);
    return res as any;
  }

  @Roles(Role.User)
  @Delete(':id')
  @UseGuards(VerifiedUserGuard)
  async deleteVehicle(@Param('id') id: string): Promise<any> {
    const res = await this.vehicleService.deleteVehicle(id);
    return res as any;
  }

  @Roles(Role.User)
  @Put(':id/set-default')
  @UseGuards(VerifiedUserGuard)
  async setDefaultVehicle(@Param('id') id: string): Promise<any> {
    const res = await this.vehicleService.setDefaultVehicle(id);
    return res as any;
  }

  @Roles(Role.User)
  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @UseGuards(VerifiedUserGuard)
  async uploadVehiclePhoto(
    @Param('id') id: string,
    @UploadedFile() file: MulterLikeFile,
    @Body('photo') photo?: string,
    @Body('photoBase64') photoBase64?: string,
    @Body('cloudinaryPublicId') cloudinaryPublicId?: string,
  ): Promise<any> {
    if (cloudinaryPublicId && photo) {
      const raw = await this.vehicleService.assignVehiclePhotoFromCloudinary(
        id,
        cloudinaryPublicId,
        photo,
      );
      if (
        raw &&
        typeof raw === 'object' &&
        !('message' in raw) &&
        'photoUrl' in raw &&
        'vehicle' in raw
      ) {
        const res = raw as UploadPhotoResponse;
        return res;
      }
      throw new Error('Invalid response from assignVehiclePhotoFromCloudinary');
    }

    if (photoBase64) {
      const raw = await this.vehicleService.uploadVehiclePhotoFromBase64(
        id,
        photoBase64,
      );
      const res = raw as unknown as UploadPhotoResponse;
      return res;
    }

    if (file) {
      const raw = await this.vehicleService.uploadVehiclePhoto(id, file);
      const res = raw as unknown as UploadPhotoResponse;
      return res;
    }

    const raw = await this.vehicleService.uploadVehiclePhotoFromUri(id, photo);
    const res = raw as unknown as UploadPhotoResponse;
    return res;
  }
}
