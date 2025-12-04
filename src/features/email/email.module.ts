import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { OtpService } from './otp.service';
import { Otp, OtpSchema } from './entities/otp.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  providers: [EmailService, OtpService],
  exports: [EmailService, OtpService],
})
export class EmailModule {}
