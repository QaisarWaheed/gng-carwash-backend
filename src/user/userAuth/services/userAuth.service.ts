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
import { NotFoundError } from 'rxjs';
import { User } from 'src/user/entities/user.entity';

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
    throw new NotFoundException('Invalid credenasdaweqsdsawtials');
    }
    
    const payload = data;
    const token = await this.jwtService.signAsync(data)
     return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },};
  }



}
