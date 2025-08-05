import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";
import { UnauthorizedAccessException } from "../../common/exceptions";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findByEmailWithRoles(payload.email);
      if (!user || !user.isActive) {
        throw new UnauthorizedAccessException();
      }

      // Enhanced user object with detailed role information
      const userRoles = user.roles.map((ur) => ur.role.name);
      const userPermissions = user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => ({
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action,
        }))
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        roles: userRoles,
        permissions: userPermissions,
      };
    } catch (error) {
      throw new UnauthorizedAccessException();
    }
  }
}
