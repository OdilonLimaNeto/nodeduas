import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import {
  UserNotFoundException,
  UserAlreadyExistsException,
  InvalidUserDataException,
  UserUpdateFailedException,
} from "../common/exceptions";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailWithRoles(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, roles = [] } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    if (roles.length > 0) {
      const existingRoles = await this.prisma.role.findMany({
        where: {
          name: { in: roles },
        },
      });

      if (existingRoles.length !== roles.length) {
        const foundRoles = existingRoles.map((role) => role.name);
        const invalidRoles = roles.filter((role) => !foundRoles.includes(role));
        throw new InvalidUserDataException(
          `Roles not found: ${invalidRoles.join(", ")}`
        );
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with roles in a transaction
      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
          },
        });

        // Assign roles if provided
        if (roles.length > 0) {
          const roleRecords = await tx.role.findMany({
            where: { name: { in: roles } },
          });

          await tx.userRole.createMany({
            data: roleRecords.map((role) => ({
              userId: newUser.id,
              roleId: role.id,
            })),
          });
        }

        return newUser;
      });

      // Return user with roles
      return this.findByIdWithRoles(user.id);
    } catch (error) {
      throw new InvalidUserDataException();
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    try {
      const updateData: any = { ...updateUserDto };

      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (updateUserDto.roles) {
        const { roles, ...userData } = updateData;

        const updatedUser = await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id },
            data: userData,
          });

          await tx.userRole.deleteMany({
            where: { userId: id },
          });

          if (roles.length > 0) {
            const roleRecords = await tx.role.findMany({
              where: { name: { in: roles } },
            });

            if (roleRecords.length !== roles.length) {
              const foundRoles = roleRecords.map((role) => role.name);
              const invalidRoles = roles.filter(
                (role) => !foundRoles.includes(role)
              );
              throw new InvalidUserDataException(
                `Roles not found: ${invalidRoles.join(", ")}`
              );
            }

            await tx.userRole.createMany({
              data: roleRecords.map((role) => ({
                userId: id,
                roleId: role.id,
              })),
            });
          }

          return user;
        });

        return this.findByIdWithRoles(updatedUser.id);
      } else {
        const updatedUser = await this.prisma.user.update({
          where: { id },
          data: updateData,
        });

        return this.findByIdWithRoles(updatedUser.id);
      }
    } catch (error) {
      if (error instanceof InvalidUserDataException) {
        throw error;
      }
      throw new UserUpdateFailedException();
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        roles: {
          include: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  async findByIdWithRoles(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        roles: {
          include: {
            role: {
              select: {
                name: true,
                description: true,
                permissions: {
                  include: {
                    permission: {
                      select: {
                        name: true,
                        description: true,
                        resource: true,
                        action: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
