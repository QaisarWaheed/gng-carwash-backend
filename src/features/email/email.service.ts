import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE') || 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    purpose: string,
  ): Promise<void> {
    try {
      const subject = this.getEmailSubject(purpose);
      const htmlContent = this.getEmailTemplate(otp, purpose);

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('Failed to send email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p style="color: #666; margin-top: 20px; font-size: 12px;">
            This link will expire in 1 hour. If you did not request this, please ignore this email.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Password Reset Request',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationLink: string,
  ): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Welcome! Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
          <p style="color: #666; margin-top: 20px; font-size: 12px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Email Verification',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  private getEmailSubject(purpose: string): string {
    switch (purpose) {
      case 'signup':
        return 'Account Verification OTP';
      case 'password-reset':
        return 'Password Reset OTP';
      case 'email-change':
        return 'Email Verification OTP';
      default:
        return 'OTP Verification';
    }
  }

  private getEmailTemplate(otp: string, purpose: string): string {
    const purposeText = {
      signup: 'verify your account',
      'password-reset': 'reset your password',
      'email-change': 'change your email address',
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Account</h2>
          <p style="color: #666; margin-bottom: 20px;">
            Use the following OTP to ${purposeText[purpose] || 'verify your account'}:
          </p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; margin-top: 20px;">
            This OTP is valid for 10 minutes. Do not share it with anyone.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>
      </div>
    `;
  }
}
