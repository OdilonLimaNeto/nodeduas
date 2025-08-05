import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Patch,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return user;
  }

  @Roles("admin")
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log("DTO", JSON.stringify(updateUserDto, null, 2));
    console.log("ID", JSON.stringify(id, null, 2));
    const user = await this.usersService.update(id, updateUserDto);
    return user;
  }

  @Roles("admin", "moderator")
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Roles("admin", "moderator")
  @Get(":id")
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

  @Roles("user", "admin", "moderator")
  @Get("profile/me")
  async getProfile(@Request() req) {
    const user = await this.usersService.findByIdWithRoles(req.user.id);
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
