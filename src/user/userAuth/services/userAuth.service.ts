import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserAuth } from '../entities/userAuth.entity';
import { Model } from 'mongoose';
import { UserAuthDto } from '../dtos/UserAuth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/Login.dto';
import { forgotPasswordDto } from '../dtos/ForgotPassword.dto';


@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel('UserAuth') private readonly userAuthModel: Model<UserAuth>,
    private jwtService: JwtService,
  ) {}

  async signup(data: UserAuthDto): Promise<UserAuth> {
    const { email, phoneNumber } = data;
    const existingUser = await this.userAuthModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email)
        throw new BadRequestException('Email is already taken');
      if (existingUser.phoneNumber === phoneNumber)
        throw new BadRequestException('Phone number is already taken');
    }

    const saltOrRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);
    data.password = hashedPassword;

    const newUser = this.userAuthModel.create(data);

    return newUser;
  }




  async validateUser(identifier:string, password:string):Promise<any>{

  const query = identifier.includes('@')
      ? { email: identifier }
      : { phoneNumber: identifier };
  const user = await this.userAuthModel.findOne(query)

  if(!user){
    throw new NotFoundException('Invalid Credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if(!isPasswordValid){
    throw new NotFoundException('Invalid passowrd');
  }
  return user
  }


  async signIn(data:LoginDto){
    console.log(data.identifier)
    console.log(data.password)

    const user = await this.validateUser(data.identifier, data.password);
    
    if(!user){
    throw new NotFoundException('Invalid Credentials');
    }
    
    const payload = data;
    const token = await this.jwtService.signAsync(data)
    console.log(token)
     return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },};
  }


async forgotPassword(identifier: string) {
  if (!identifier) throw new BadRequestException('Email or phone number required');

  const query = identifier.includes('@')
    ? { email: identifier }
    : { phoneNumber: identifier };

  const user = await this.userAuthModel.findOne(query);
  if (!user) throw new NotFoundException(`${identifier} not found`);

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiresAt = expiry;
  await user.save();

  console.log(`OTP ${otp} sent to ${identifier}`);

  return { success: true, message: 'OTP sent successfully' };
}

async verifyOtp(identifier: string, otp: string) {
  if (!identifier || !otp) {
    throw new BadRequestException('Identifier and OTP are required');
  }

  const query = identifier.includes('@')
    ? { email: identifier }
    : { phoneNumber: identifier };

  const user = await this.userAuthModel.findOne(query);
  if (!user) {
    throw new NotFoundException(`${identifier} not found`);
  }

  if (!user.otp || !user.otpExpiresAt) {
    throw new BadRequestException('No OTP request found for this user');
  }

  if (new Date() > user.otpExpiresAt) {
    throw new BadRequestException('OTP has expired. Please request a new one.');
  }

  if (user.otp !== otp) {
    throw new BadRequestException('Invalid OTP. Please try again.');
  }

  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return { success: true, message: 'OTP verified successfully' };
}

async changePassword(identifier: string, newPassword: string) {
  if (!identifier || !newPassword) {
    throw new BadRequestException('Identifier and new password are required');
  }

  const query = identifier.includes('@')
    ? { email: identifier }
    : { phoneNumber: identifier };

  const user = await this.userAuthModel.findOne(query);
  if (!user) {
    throw new NotFoundException(`${identifier} does not exist in our system`);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await this.userAuthModel.updateOne(query, { password: hashedPassword });

  return { success: true, message: 'Password changed successfully!' };
}

}
