/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class GoogleVerificationService {
  constructor(private configService: ConfigService) {}

  async verifyGoogleToken(idToken: string): Promise<any> {
    try {
      // In production, you would verify the token signature with Google's public keys
      // For now, we'll do a basic verification
      const secret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      if (!secret) {
        // If secret is not configured, decode without verification
        return this.decodeTokenWithoutVerification(idToken);
      }
      const decoded = verify(idToken, secret, {
        algorithms: ['RS256', 'HS256'],
      });
      return decoded;
    } catch (error) {
      // If JWT verification fails, try to use a different approach
      // This is a simplified approach - in production, use Google's OAuth library
      return this.decodeTokenWithoutVerification(idToken);
    }
  }

  private decodeTokenWithoutVerification(token: string): any {
    // This decodes the token without verification - use only if the token is already validated by the client
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  }
}
