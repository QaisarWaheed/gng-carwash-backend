import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Model } from 'mongoose';
import { UserAuth } from 'src/features/user/userAuth/entities/userAuth.entity';


@Injectable()
export class VerifiedUserGuard implements CanActivate {
  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) return false;

    const role = (user.role || '').toString();
    const isUserRole = role.toLowerCase() === 'user';

    if (!isUserRole) return true;

   
    if (typeof user.isVerified !== 'undefined') {
      if (user.isVerified) return true;
      throw new HttpException(
        { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before performing this action' },
        HttpStatus.UNAUTHORIZED,
      );
    }

   
    const userId = user.sub || user.id || user._id;
    if (!userId) return false;

    const userModel = this.moduleRef.get<Model<UserAuth>>('UserAuthModel', { strict: false });
    if (!userModel) return false;

    const dbUser = await userModel.findById(userId).select('isVerified').lean();
    if (!dbUser) return false;
    if (dbUser.isVerified) return true;

    throw new HttpException(
      { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before performing this action' },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
