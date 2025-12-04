/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Apple Strategy placeholder
 * Note: Apple ID authentication is handled directly through token verification
 * in the AppleVerificationService rather than through Passport strategy
 * because Apple requires different handling for mobile vs web apps.
 */
@Injectable()
export class AppleStrategy {
  constructor(private configService: ConfigService) {}

  getTeamId(): string {
    return this.configService.get<string>('APPLE_TEAM_ID') || '';
  }

  getKeyId(): string {
    return this.configService.get<string>('APPLE_KEY_ID') || '';
  }

  getBundleId(): string {
    return this.configService.get<string>('APPLE_BUNDLE_ID') || '';
  }
}
