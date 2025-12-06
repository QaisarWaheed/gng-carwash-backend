import { MongooseModule } from '@nestjs/mongoose';
import userAuthSchema, { UserAuth } from './entities/userAuth.entity';
import { UserAuthService } from './services/userAuth.service';
import { UserAuthController } from './controllers/user-auth/user-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'jwtConstants';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/strategies/jwtStrategy/jwt.strategy';
import { GoogleStrategy } from 'src/strategies/google/google.strategy';
import { ConfigService } from '@nestjs/config';
import employeeSchema, { Employee } from '../employee/entities/employee.entity';
import { Module } from '@nestjs/common';
import { UserAddress, UserAddressSchema } from '../entities/userAddress.entity';
import { EmailModule } from '../../email/email.module';
import { GoogleVerificationService } from './services/google-verification.service';
import { AppleVerificationService } from './services/apple-verification.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
    MongooseModule.forFeature([
      { name: UserAuth.name, schema: userAuthSchema },
      { name: Employee.name, schema: employeeSchema },
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
    EmailModule,
  ],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    JwtStrategy,
    GoogleStrategy,
    ConfigService,
    GoogleVerificationService,
    AppleVerificationService,
  ],
  exports: [JwtStrategy, UserAuthService],
})
export class UserAuthModule {}
