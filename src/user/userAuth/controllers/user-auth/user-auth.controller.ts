import { Body, Controller, HttpException, HttpStatus, Inject, Post } from '@nestjs/common';
import { UserAuthService } from '../../services/userAuth.service';
import { UserAuthDto } from '../../dtos/UserAuth.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../dtos/Login.dto';
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
}
