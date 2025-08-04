import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("logout")
  async logout(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(
      req.user.userId,
      refreshTokenDto.refresh_token
    );
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("logout-all")
  async logoutAll(@Request() req) {
    await this.authService.revokeAllRefreshTokens(req.user.userId);
    return { message: "Logged out from all devices" };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
