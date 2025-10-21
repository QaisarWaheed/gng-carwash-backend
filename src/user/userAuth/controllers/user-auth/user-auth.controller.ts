import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post } from '@nestjs/common';
import { UserAuthService } from '../../services/userAuth.service';
import { UserAuthDto } from '../../dtos/UserAuth.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../dtos/Login.dto';
import { forgotPasswordDto } from '../../dtos/ForgotPassword.dto';
@ApiTags('User-Auth')
@Controller('user-auth')
export class UserAuthController {

constructor(private readonly userAuthService: UserAuthService){}

@Post('signup')
async signupUser(@Body() data:UserAuthDto){
return this.userAuthService.signup(data);
}



@Post('login')
async signInUser(@Body() data:LoginDto){
    return await this.userAuthService.signIn(data)
}

@Post('forgot-password')
async forgotPassword(@Body() data:forgotPasswordDto){
    console.log('Received identifier:', data.identifier);
    return await this.userAuthService.forgotPassword(data.identifier)
}


@Post('verify-otp')
async verifyOtp(@Body() body: { identifier: string; otp: string }) {
  return this.userAuthService.verifyOtp(body.identifier, body.otp);
}

@Post('change-password')
async changePassword(@Body() body: { identifier: string; newPassword: string }) {
  return this.userAuthService.changePassword(body.identifier, body.newPassword);
}




}
