import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AppleAuthDto {
  @ApiProperty({
    description: 'Apple ID token from frontend',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  identityToken: string;

  @ApiProperty({
    description: 'User information from Apple',
    required: false,
  })
  @IsOptional()
  userInfo?: {
    sub: string;
    email: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export class AppleSignupDto {
  @ApiProperty({
    description: 'Apple identity token from frontend',
  })
  @IsString()
  identityToken: string;

  @ApiProperty({
    description: 'User info (may be null on first sign in)',
    required: false,
  })
  @IsOptional()
  userInfo?: {
    email: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}
