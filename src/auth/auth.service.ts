import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const userWithRoles = await this.usersService.findByEmailWithRoles(
      user.email
    );

    const payload = {
      email: user.email,
      sub: user.id,
      roles: userWithRoles.roles.map((ur) => ur.role.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
    });

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: userWithRoles.roles.map((ur) => ur.role.name),
      },
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const user = await this.usersService.findByEmailWithRoles(payload.email);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const isValidToken = await this.validateRefreshToken(
        user.id,
        refreshTokenDto.refresh_token
      );

      if (!isValidToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const newPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles.map((ur) => ur.role.name),
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
      });

      // Revoke old refresh token and store new one
      await this.revokeRefreshToken(refreshTokenDto.refresh_token);
      await this.storeRefreshToken(user.id, newRefreshToken);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.revokeRefreshToken(refreshToken);
    return { message: "Logged out successfully" };
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token,
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!refreshToken;
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  private async revokeRefreshToken(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
