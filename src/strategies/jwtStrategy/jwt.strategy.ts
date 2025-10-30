import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    console.log(configService.get<string>('JWT_SECRET') as string);
    const config = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    };
    super(config);
  }

  async validate(payload: any) {
    console.log('JWT payload received in strategy:', payload);
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
