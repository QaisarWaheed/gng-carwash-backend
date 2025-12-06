import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { UserAuthService } from '../../services/userAuth.service';
import { UserAuthDto } from '../../dtos/userAuth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../dtos/login.dto';
import { forgotPasswordDto } from '../../dtos/forgotPassword.dto';
import { UpdateWorkerDto } from '../../dtos/updateWorker.dto';
import { UpdateProfileDto } from '../../dtos/updateProfile.dto';
import { ResetPasswordDto } from '../../dtos/resetPassword.dto';
import { Role } from 'src/types/enum.class';
import { Roles } from 'src/decorators/Roles.decorator';
import { AuthGuardWithRoles } from 'src/guards/authGuart';
import express from 'express';
import { GoogleAuthDto } from '../../dtos/google-auth.dto';
import { AppleAuthDto } from '../../dtos/apple-auth.dto';

@ApiTags('User-Auth')
@Controller('user-auth')
@ApiBearerAuth()
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('check-token')
  checkToken(@Headers('authorization') authHeader: string) {
    return { receivedToken: authHeader };
  }

  @Post('signup')
  async signupUser(@Body() data: UserAuthDto) {
    return this.userAuthService.signup(data);
  }

  @Post('login')
  async signInUser(@Body() data: LoginDto) {
    return await this.userAuthService.signIn(data);
  }

  @Post('login/google')
  async googleLogin(@Body() data: GoogleAuthDto) {
    return await this.userAuthService.googleLogin(
      data.googleToken,
      data.userInfo,
    );
  }

  @Post('signup/google')
  async googleSignup(@Body() data: GoogleAuthDto) {
    return await this.userAuthService.googleSignup(
      data.googleToken,
      data.userInfo,
    );
  }

  @Post('login/apple')
  async appleLogin(@Body() data: AppleAuthDto) {
    return await this.userAuthService.appleLogin(
      data.identityToken,
      data.userInfo,
    );
  }

  @Post('signup/apple')
  async appleSignup(@Body() data: AppleAuthDto) {
    return await this.userAuthService.appleSignup(
      data.identityToken,
      data.userInfo,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: forgotPasswordDto) {
    return await this.userAuthService.forgotPassword(data.identifier);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { identifier: string }) {
    return await this.userAuthService.resendVerification(body.identifier);
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

  @Post('logout')
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @UseGuards(AuthGuardWithRoles)
  @Get('me')
  async getCurrentUser(@Req() req: any) {
    const userId = req.user.sub;
    return this.userAuthService.getUserProfile(userId);
  }

  @UseGuards(AuthGuardWithRoles)
  @Patch('update-profile')
  async updateProfile(@Req() req: any, @Body() updateData: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.userAuthService.updateUserProfile(userId, updateData);
  }

  @UseGuards(AuthGuardWithRoles)
  @Post('reset-password')
  async resetPassword(@Req() req: any, @Body() body: ResetPasswordDto) {
    const userId = req.user.sub;
    return this.userAuthService.resetPassword(userId, body.newPassword);
  }

  @UseGuards(AuthGuardWithRoles)
  @Post('refresh')
  async refreshToken(@Req() req: any) {
    const { sub, email, role } = req.user;
    return this.userAuthService.refreshToken(sub, email, role);
  }

  //employee and manager

  @Get()
  async findAllUsers() {
    return await this.userAuthService.getAllUsers();
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Get('get-managers')
  async findAllManagers(@Param('role') role: Role) {
    role = Role.Manager;
    return await this.userAuthService.getAll(role);
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin, Role.Manager)
  @Get('get-employees')
  async findAllEmployees(role: Role) {
    role = Role.Employee;
    return await this.userAuthService.getAll(role);
  }

  @UseGuards(AuthGuardWithRoles)
  @Roles(Role.Admin)
  @Get('get-users')
  async findAllCustomers() {
    const role = Role.User;
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
  async createManager(@Body() data: UserAuthDto) {
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
  @Delete('delete-role/:id')
  async deleteWorker(@Param('id') id: string) {
    return await this.userAuthService.deleteWorker(id);
  }
}
