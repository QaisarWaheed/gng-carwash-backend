import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from frontend',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  googleToken: string;

  @ApiProperty({
    description: 'User information from Google',
  })
  @IsOptional()
  userInfo?: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };
}

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID token from frontend',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  idToken: string;
}

export class GoogleSignupDto {
  @ApiProperty({
    description: 'Google ID token from frontend',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  idToken: string;
}
