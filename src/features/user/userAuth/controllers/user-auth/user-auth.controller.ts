/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from '../../services/userAuth.service';
import { UserAuthDto } from '../../dtos/userAuth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../dtos/login.dto';
import { forgotPasswordDto } from '../../dtos/forgotPassword.dto';
import { UpdateWorkerDto } from '../../dtos/updateWorker.dto';
import { Role } from 'src/types/enum.class';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuardWithRoles } from 'src/guards/authGuart';
import express from 'express';

@ApiTags('User-Auth')
@Controller('user-auth')
@ApiBearerAuth()
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) { }

  @Post('signup')
  async signupUser(@Body() data: UserAuthDto) {
    console.log(data)
    return this.userAuthService.signup(data);
  }

  @Post('login')
  async signInUser(@Body() data: LoginDto) {
    console.log(data)
    return await this.userAuthService.signIn(data);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: forgotPasswordDto) {
    console.log('Received identifier:', data.identifier);
    return await this.userAuthService.forgotPassword(data.identifier);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { identifier: string; otp: string }) {
    return this.userAuthService.verifyOtp(body.identifier, body.otp);
  }

  @Post('change-password')
  async changePassword(
    @Body() body: { identifier: string; newPassword: string },
  ) {
    return this.userAuthService.changePassword(
      body.identifier,
      body.newPassword,
    );
  }

  //employee and manager

  @Get()
  async findAllUsers() {
    return await this.userAuthService.getAllUsers();
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Get('getAll/:role')
  async findAllWorkers(@Param('role') role: Role) {
    return await this.userAuthService.getAll(role);
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Post('create-employee')
  async createEmployee(@Body() data: UserAuthDto) {
    const newEmployee = await this.userAuthService.createEmployee(data);
    return newEmployee;
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Post('create-manager')
  async createManager(@Body() data: UserAuthDto, req: express.Request) {
    console.log('Request headers:', req.headers);
    const newEmployee = await this.userAuthService.createManager(data);
    return newEmployee;
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Patch('update-worker/:id')
  async updateWorker(@Param('id') id: string, @Body() data: UpdateWorkerDto) {
    return await this.userAuthService.updateWorker(id, data);
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Delete('delete-worker/:id')
  async deleteWorker(@Param('id') id: string) {
    return await this.userAuthService.deleteWorker(id);
  }
}
