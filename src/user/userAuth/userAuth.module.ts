import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import userAuthSchema, { UserAuth } from './entities/userAuth.entity';
import { UserAuthService } from './services/userAuth.service';
import { UserAuthController } from './controllers/user-auth/user-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'jwtConstants';
 

@Module({
  imports: [JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),MongooseModule.forFeature([{name:UserAuth.name, schema:userAuthSchema}])],
  controllers: [UserAuthController],
  providers: [UserAuthService],
})
export class UserAuthModule {}
