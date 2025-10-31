import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import userAuthSchema, { UserAuth } from './entities/userAuth.entity';
import { UserAuthService } from './services/userAuth.service';
import { UserAuthController } from './controllers/user-auth/user-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'jwtConstants';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/strategies/jwtStrategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';

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
    ]),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, JwtStrategy, ConfigService],
  exports: [JwtStrategy],
})
export class UserAuthModule {}
