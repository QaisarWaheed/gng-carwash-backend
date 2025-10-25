/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from '../../services/userAuth.service';
import { UserAuthDto } from '../../dtos/UserAuth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../dtos/Login.dto';
import { forgotPasswordDto } from '../../dtos/ForgotPassword.dto';
import { UpdateWorkerDto } from '../../dtos/UpdateWorker.dto';
import { Role } from 'src/types/enum.class';
import { Roles } from 'src/decorators/Roles.decorator';
import { AuthGuardWithRoles } from 'src/guards/AuthGuard';
@ApiTags('User-Auth')
@Controller('user-auth')
@ApiBearerAuth()
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('signup')
  async signupUser(@Body() data: UserAuthDto) {
    return this.userAuthService.signup(data);
  }

  @Post('login')
  async signInUser(@Body() data: LoginDto) {
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

  // @Get('getAll/:role')
  // async findAllWorkers(@Param('role') role: role) {
  //   return await this.userAuthService.getAll(role);
  // }

  @Post('create-employee')
  async createEmployee(@Body() data: UserAuthDto) {
    const newEmployee = await this.userAuthService.createEmployee(data);
    return newEmployee;
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Post('create-manager')
  async createManager(@Body() data: UserAuthDto) {
    const newEmployee = await this.userAuthService.createManager(data);
    return newEmployee;
  }

  @Patch('update-worker/:id')
  async updateWorker(@Param('id') id: string, @Body() data: UpdateWorkerDto) {
    return await this.userAuthService.updateWorker(id, data);
  }

  @Delete('delete-worker/:id')
  async deleteWorker(@Param('id') id: string) {
    return await this.userAuthService.deleteWorker(id);
  }
}
