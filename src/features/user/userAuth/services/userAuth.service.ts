/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Roles, UserAuth } from '../entities/userAuth.entity';
import { Connection, Model, Types } from 'mongoose';
import { UserAuthDto } from '../dtos/userAuth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { UpdateWorkerDto } from '../dtos/updateWorker.dto';
import { ConfigService } from '@nestjs/config';
import { Employee } from '../../employee/entities/employee.entity';
import { EmailService } from '../../../email/email.service';
import { OtpService } from '../../../email/otp.service';
import { GoogleVerificationService } from './google-verification.service';
import { AppleVerificationService } from './apple-verification.service';


@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel('UserAuth') private readonly userAuthModel: Model<UserAuth>,
    @InjectModel('Employee') private readonly employeeModel: Model<Employee>,
    @InjectConnection() private readonly connection: Connection,

    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly googleVerificationService: GoogleVerificationService,
    private readonly appleVerificationService: AppleVerificationService,
  ) { }



  async getById(id: string): Promise<UserAuth | Employee> {
    let user = await this.userAuthModel.findById(id);

    if (!user) {
      throw new NotFoundException("no user or employee found");
    }
    return user;
  }



  async signup(data: UserAuthDto): Promise<{ message: string; email: string }> {

    const { email, phoneNumber } = data;
    const existingUser = await this.userAuthModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });







    if (existingUser) {
      const emailTaken = existingUser.email === email;
      const phoneTaken = existingUser.phoneNumber === phoneNumber;

      if (emailTaken && phoneTaken) {
        throw new BadRequestException('Email & Phone number are already taken');
      }

      if (emailTaken) {
        throw new BadRequestException('Email is already taken');
      }

      if (phoneTaken) {
        throw new BadRequestException('Phone number is already taken');
      }
    }


    const saltOrRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);
    data.password = hashedPassword;

    // Create user with unverified status
    const newUser = await this.userAuthModel.create({
      ...data,
      isVerified: false,
    });

    // Generate and send OTP
    try {
      const otp = await this.otpService.generateOtp(email, 'signup');
      await this.emailService.sendOtpEmail(email, otp, 'signup');
    } catch (error) {
      // Delete user if email sending fails
      await this.userAuthModel.deleteOne({ _id: newUser._id });
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    return {
      message: 'User registered successfully. OTP sent to your email.',
      email: email,
    };

  }




  async validateUser(identifier: string, password: string): Promise<any> {
    const query = identifier.includes('@')
      ? { email: identifier }
      : { phoneNumber: identifier };

    const user = await this.userAuthModel.findOne(query);

    if (!user) {
      throw new NotFoundException('Invalid Credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid Credentials');
    }

    return user;
  }

  async signIn(data: LoginDto) {
    const user = await this.validateUser(data.identifier, data.password);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'a-string-secret-at-least-256-bits-long',
    });
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }

  async forgotPassword(identifier: string) {
    if (!identifier)
      throw new BadRequestException('Email or phone number required');

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
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
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

  //Employee and Manager

  async getAllUsers() {
    return await this.userAuthModel.find();
  }

  async getAll(role: Roles): Promise<UserAuth[] | null> {
    return await this.userAuthModel.find({ role: role });
  }

  async createEmployee(dto: UserAuthDto): Promise<Employee | null> {


    try {

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.userAuthModel.create(
        [
          {
            name: dto.fullName,
            email: dto.email,
            phone: dto.phoneNumber,
            password: hashedPassword,
            role: 'Employee',
          },
        ],

      );

      const employee = await this.employeeModel.create(
        [
          {
            userId: user[0]._id,
            status: 'active',
            assignedBookings: [],
            averageRating: 0,
            completedJobs: 0,
            flags: [],
          },
        ],

      );



      return this.employeeModel
        .findById(employee[0]._id)
        .populate('userId', 'name email role phone');
    } catch (error) {

      throw new BadRequestException(error.message);
    }
  }

  async createManager(data: UserAuthDto): Promise<UserAuth> {
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
    data.role = 'Manager';

    const newUser = this.userAuthModel.create(data);

    return newUser;
  }

  async updateWorker(id: string, data: Partial<UpdateWorkerDto>) {
    const updatedWorker = await this.userAuthModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedWorker) {
      throw new NotFoundException(`No Worker Exist with this Id: ${id}`);
    }

    return updatedWorker;
  }

  async deleteWorker(id: string) {
    const deleteWorker = await this.userAuthModel.findByIdAndDelete(id);
    if (!deleteWorker) {
      throw new NotFoundException(`No Worker Exist with this Id: ${id}`);
    }

    return { message: 'User deleted Succesfuly' };
  }

  async getUserProfile(userId: string): Promise<UserAuth> {
    const user = await this.userAuthModel.findById(userId).select('-password -otp -otpExpiresAt');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserProfile(userId: string, updateData: Partial<UserAuthDto>): Promise<UserAuth> {

    const { password, role, ...safeUpdateData } = updateData as any;

    const updatedUser = await this.userAuthModel
      .findByIdAndUpdate(userId, safeUpdateData, { new: true })
      .select('-password -otp -otpExpiresAt');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async resetPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userAuthModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userAuthModel.updateOne({ _id: userId }, { password: hashedPassword });

    return { success: true, message: 'Password reset successfully' };
  }

  async refreshToken(userId: string, email: string, role: Roles): Promise<{ token: string }> {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'a-string-secret-at-least-256-bits-long',
    });

    return { token };
  }

  async googleLogin(googleToken: string, userInfo: any) {
    try {
      // Verify the Google token
      const verifiedUserInfo = await this.googleVerificationService.verifyGoogleToken(googleToken);
      const { email, name, picture, sub } = userInfo || verifiedUserInfo;

      let user = await this.userAuthModel.findOne({ email });

      if (!user) {
        throw new NotFoundException('No account found with this email. Please sign up first.');
      }

      if (!user.googleId) {
        user.googleId = sub;
        if (picture) user.avatar = picture;
        await user.save();
      }

      const payload = {
        sub: user._id,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'a-string-secret-at-least-256-bits-long',
      });

      return {
        success: true,
        message: 'Google login successful',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Google login failed');
    }
  }

  async googleSignup(googleToken: string, userInfo: any) {
    try {
      // Verify the Google token
      const verifiedUserInfo = await this.googleVerificationService.verifyGoogleToken(googleToken);
      const { email, name, picture, sub } = userInfo || verifiedUserInfo;

      const existingUser = await this.userAuthModel.findOne({ email });

      if (existingUser) {
        throw new BadRequestException('An account with this email already exists. Please login instead.');
      }

      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      const newUser = await this.userAuthModel.create({
        fullName: name,
        email: email,
        password: hashedPassword,
        role: 'User',
        googleId: sub,
        avatar: picture,
        isVerified: true,
      });

      const payload = {
        sub: newUser._id,
        email: newUser.email,
        role: newUser.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'a-string-secret-at-least-256-bits-long',
      });

      return {
        success: true,
        message: 'Google signup successful',
        token,
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Google signup failed');
    }
  }

  async appleLogin(identityToken: string, userInfo: any) {
    try {
      // Verify the Apple token
      const verifiedUserInfo = await this.appleVerificationService.verifyAppleToken(identityToken);
      const { email, sub } = userInfo || verifiedUserInfo;

      let user = await this.userAuthModel.findOne({ email });

      if (!user) {
        throw new NotFoundException('No account found with this email. Please sign up first.');
      }

      if (!user.appleId) {
        user.appleId = sub;
        await user.save();
      }

      const payload = {
        sub: user._id,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'a-string-secret-at-least-256-bits-long',
      });

      return {
        success: true,
        message: 'Apple login successful',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Apple login failed');
    }
  }

  async appleSignup(identityToken: string, userInfo: any) {
    try {
      // Verify the Apple token
      const verifiedUserInfo = await this.appleVerificationService.verifyAppleToken(identityToken);
      const { email, sub, name } = userInfo || verifiedUserInfo;

      if (!email) {
        throw new BadRequestException('Email is required for Apple signup');
      }

      const existingUser = await this.userAuthModel.findOne({ email });

      if (existingUser) {
        throw new BadRequestException('An account with this email already exists. Please login instead.');
      }

      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      // Extract full name from userInfo or Apple token
      let fullName = 'Apple User';
      if (name) {
        if (typeof name === 'string') {
          fullName = name;
        } else if (name.firstName && name.lastName) {
          fullName = `${name.firstName} ${name.lastName}`;
        } else if (name.firstName) {
          fullName = name.firstName;
        }
      }

      const newUser = await this.userAuthModel.create({
        fullName: fullName,
        email: email,
        password: hashedPassword,
        role: 'User',
        appleId: sub,
        isVerified: true,
      });

      const payload = {
        sub: newUser._id,
        email: newUser.email,
        role: newUser.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'a-string-secret-at-least-256-bits-long',
      });

      return {
        success: true,
        message: 'Apple signup successful',
        token,
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Apple signup failed');
    }
  }
}
