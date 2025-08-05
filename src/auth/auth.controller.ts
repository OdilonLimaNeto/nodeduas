import { Controller, Post, Body, Get, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post("refresh")
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post("logout")
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refresh_token);
  }

  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @Post("logout-all")
  async logoutAll(@Request() req) {
    await this.authService.revokeAllRefreshTokens(req.user.id);
    return { message: "Logged out from all devices" };
  }

  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
