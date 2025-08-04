import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles("admin")
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((ur) => ({
          name: ur.role.name,
          description: ur.role.description,
          permissions: ur.role.permissions.map((rp) => ({
            name: rp.permission.name,
            description: rp.permission.description,
            resource: rp.permission.resource,
            action: rp.permission.action,
          })),
        })),
      },
    };
  }

  @Get()
  @Roles("admin")
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: "Users retrieved successfully",
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        roles: user.roles.map((ur) => ur.role.name),
      })),
    };
  }

  @Get(":id")
  @Roles("admin")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findByIdWithRoles(id);
    return {
      message: "User retrieved successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        roles: user.roles.map((ur) => ({
          name: ur.role.name,
          description: ur.role.description,
          permissions: ur.role.permissions.map((rp) => ({
            name: rp.permission.name,
            description: rp.permission.description,
            resource: rp.permission.resource,
            action: rp.permission.action,
          })),
        })),
      },
    };
  }

  @Get("profile/me")
  @Roles("user", "admin")
  async getProfile(@Request() req) {
    const user = await this.usersService.findByIdWithRoles(req.user.userId);
    return {
      message: "Profile retrieved successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((ur) => ur.role.name),
      },
    };
  }
}
