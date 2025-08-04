import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("?? Starting seed...");

  // Create comprehensive permissions
  const permissions = [
    {
      name: "users:read",
      description: "Can read users",
      resource: "users",
      action: "read",
    },
    {
      name: "users:write",
      description: "Can create/update users",
      resource: "users",
      action: "write",
    },
    {
      name: "users:delete",
      description: "Can delete users",
      resource: "users",
      action: "delete",
    },
    {
      name: "roles:read",
      description: "Can read roles",
      resource: "roles",
      action: "read",
    },
    {
      name: "roles:write",
      description: "Can create/update roles",
      resource: "roles",
      action: "write",
    },
    {
      name: "roles:delete",
      description: "Can delete roles",
      resource: "roles",
      action: "delete",
    },
    {
      name: "permissions:read",
      description: "Can read permissions",
      resource: "permissions",
      action: "read",
    },
    {
      name: "permissions:write",
      description: "Can create/update permissions",
      resource: "permissions",
      action: "write",
    },
    {
      name: "system:admin",
      description: "Full system administration",
      resource: "system",
      action: "admin",
    },
  ];

  console.log("?? Creating permissions...");
  const createdPermissions = {};
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions[perm.name] = permission;
  }

  // Create roles
  console.log("?? Creating roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Full system administrator with all permissions",
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: "moderator" },
    update: {},
    create: {
      name: "moderator",
      description: "Moderator with limited admin permissions",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with basic permissions",
    },
  });

  // Assign ALL permissions to admin role
  console.log("?? Assigning permissions to admin role...");
  for (const permName of Object.keys(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: createdPermissions[permName].id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: createdPermissions[permName].id,
      },
    });
  }

  // Assign read permissions to moderator role
  console.log("?? Assigning permissions to moderator role...");
  const moderatorPermissions = ["users:read", "users:write", "roles:read"];
  for (const permName of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: createdPermissions[permName].id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: createdPermissions[permName].id,
      },
    });
  }

  // Assign basic permissions to user role
  console.log("?? Assigning permissions to user role...");
  const userPermissions = ["users:read"];
  for (const permName of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: createdPermissions[permName].id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: createdPermissions[permName].id,
      },
    });
  }

  // Create users
  console.log("?? Creating users...");

  // Super Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Super Admin",
    },
  });

  // Moderator User
  const moderatorPassword = await bcrypt.hash("moderator123", 10);
  const moderatorUser = await prisma.user.upsert({
    where: { email: "moderator@example.com" },
    update: {},
    create: {
      email: "moderator@example.com",
      password: moderatorPassword,
      name: "Moderator User",
    },
  });

  // Regular User
  const userPassword = await bcrypt.hash("user123", 10);
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "Regular User",
    },
  });

  // Assign roles to users
  console.log("?? Assigning roles to users...");

  // Admin user gets admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Moderator user gets moderator role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: moderatorUser.id,
        roleId: moderatorRole.id,
      },
    },
    update: {},
    create: {
      userId: moderatorUser.id,
      roleId: moderatorRole.id,
    },
  });

  // Regular user gets user role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: userRole.id,
    },
  });

  console.log("? Seed completed successfully!");
  console.log("\n?? Created users:");
  console.log("?? Admin: admin@example.com / admin123 (All permissions)");
  console.log(
    "?? Moderator: moderator@example.com / moderator123 (Limited admin permissions)"
  );
  console.log("?? User: user@example.com / user123 (Basic permissions)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
