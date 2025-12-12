import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'DEV_SECRET_KEY',
    });
  }

  public async validate(payload: JwtPayload) {
    const user = await this.usersService.findByIdWithEnterprise(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Error : user not found or inactive');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Error: this user has been deactivated');
    }

    if (user.enterprise && user.enterprise.isActive === false) {
      throw new UnauthorizedException('Error: this users company is inactive.');
    }

    return user;
  }
}
