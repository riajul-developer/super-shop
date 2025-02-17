import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  
  await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Super-admin',
    },
  });

  console.log('Role created successfully');

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'super.admin@gmail.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'super.admin@gmail.com',
      password: hashedPassword,
      roleId: 1,
    },
  });

  console.log('Super admin user created successfully');

  const permissions = [
    'product_add',
    'product_edit',
    'product_delete',
    'content_add',
    'content_edit',
    'content_delete',
    'user_add',
    'user_edit',
    'user_delete',
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
  }

  console.log('Permissions created successfully');
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
