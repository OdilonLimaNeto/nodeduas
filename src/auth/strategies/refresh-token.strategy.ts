import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refresh_token"),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const isValid = await this.authService.validateRefreshToken(
      payload.sub,
      refreshToken
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
