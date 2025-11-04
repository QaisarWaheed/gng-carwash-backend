import {
  BadRequestException,
  Get,
  HttpException,
  HttpStatus,
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
import { AdminLoginDto } from '../dtos/adminLogin.dto';
import { ConfigService } from '@nestjs/config';
import { Employee } from 'src/user/employee/entities/employee.entity';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel('UserAuth') private readonly userAuthModel: Model<UserAuth>,
    @InjectModel('Employee') private readonly employeeModel: Model<Employee>,
    @InjectConnection() private readonly connection: Connection,

    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }



  async getById(id: string): Promise<UserAuth | Employee> {
    let user = await this.userAuthModel.findById(id);

    if (!user) {
      throw new NotFoundException("no user or employee found");
    }
    return user;
  }



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
      secret: 'a-string-secret-at-least-256-bits-long',
    });
    console.log(token);
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
}
