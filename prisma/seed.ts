// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  
  const permissions = [
    { name: 'create', description: 'Permission to create resources' },
    { name: 'read', description: 'Permission to read resources' },
    { name: 'update', description: 'Permission to update resources' },
    { name: 'delete', description: 'Permission to delete resources' },
  ];

  // Insert permissions into the database
  for (const perm of permissions) {
    await prisma.permission.create({
      data: perm,
    });
  }

  // You can also seed roles or users if needed
  console.log('Permissions seeded successfully');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
