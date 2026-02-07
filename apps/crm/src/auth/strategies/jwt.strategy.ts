import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { JwtPayload } from '@app/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('JwtStrategy');

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
    this.logger.log(`JWT Strategy initialized. Secret available: ${!!process.env.JWT_SECRET}`);
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT for user: ${payload.email} (${payload.sub})`);
    return { id: payload.sub, email: payload.email, role: payload.role, sid: payload.sid };
  }
}
