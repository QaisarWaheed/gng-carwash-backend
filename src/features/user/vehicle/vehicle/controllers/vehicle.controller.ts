import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehicleService } from '../services/vehicle.service';
import { AuthGuardWithRoles } from 'src/guards/authGuart';
import { Roles } from 'src/decorators/Roles.decorator';
import { Role } from 'src/types/enum.class';
import { CreateVehicleDto } from '../dtos/createVehicleDto';


@Controller('vehicles')
@UseGuards(AuthGuardWithRoles)
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) { }

    @Roles(Role.User)
    @Post()
    async createVehicle(@Body() dto: CreateVehicleDto) {
        return await this.vehicleService.createVehicle(dto);
    }

    @Roles(Role.Admin)
    @Roles(Role.User)
    @Get()
    async getAllVehicles() {
        return await this.vehicleService.getAllVehicles();
    }

    @Roles(Role.User)
    @Get('user/:userId')
    async getUserVehicles(@Param('userId') userId: string) {
        return await this.vehicleService.getVehiclesByUser(userId);
    }

    @Roles(Role.User)
    @Get(':id')
    async getVehicle(@Param('id') id: string) {
        return await this.vehicleService.getVehicleById(id);
    }

    @Roles(Role.User)
    @Put(':id')
    async updateVehicle(@Param('id') id: string, @Body() dto: Partial<CreateVehicleDto>) {
        return await this.vehicleService.updateVehicle(id, dto);
    }

    @Roles(Role.User)
    @Delete(':id')
    async deleteVehicle(@Param('id') id: string) {
        return await this.vehicleService.deleteVehicle(id);
    }

    @Roles(Role.User)
    @Put(':id/set-default')
    async setDefaultVehicle(@Param('id') id: string) {
        return await this.vehicleService.setDefaultVehicle(id);
    }

    @Roles(Role.User)
    @Post(':id/photo')
    @UseInterceptors(FileInterceptor('photo'))
    async uploadVehiclePhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return await this.vehicleService.uploadVehiclePhoto(id, file);
    }
}
