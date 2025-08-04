import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

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

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, roles = [] } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
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
        throw new NotFoundException(
          `Roles not found: ${invalidRoles.join(", ")}`
        );
      }
    }

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
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
