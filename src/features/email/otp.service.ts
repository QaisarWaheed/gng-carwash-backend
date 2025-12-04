import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  /**
   * Generate and save OTP
   */
  async generateOtp(email: string, purpose: string): Promise<string> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await this.otpModel.deleteMany({ email, purpose });

    // Save new OTP with 10-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.otpModel.create({
      email,
      otp,
      purpose,
      expiresAt,
      isVerified: false,
    });

    return otp;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string, purpose: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      email,
      otp,
      purpose,
      isVerified: false,
    });

    if (!otpRecord) {
      throw new NotFoundException('Invalid OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    return true;
  }

  /**
   * Get latest OTP for email and purpose
   */
  async getLatestOtp(email: string, purpose: string): Promise<Otp | null> {
    return this.otpModel
      .findOne({ email, purpose })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Check if OTP is verified
   */
  async isOtpVerified(email: string, purpose: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      email,
      purpose,
      isVerified: true,
    });

    return !!otpRecord;
  }

  /**
   * Delete OTP after use
   */
  async deleteOtp(email: string, purpose: string): Promise<void> {
    await this.otpModel.deleteMany({ email, purpose });
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps(): Promise<void> {
    await this.otpModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }
}
