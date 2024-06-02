import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const users = await tx.users.findMany();
    for (const user of users) {
      const tag = user.tag as any;

      if (typeof tag === 'object') {
        continue;
      }

      const newTag = user.tag as string;

      const fixTag = JSON.parse(newTag.replace(/^"|"$/g, ''));

      await tx.users.update({
        where: { id: user.id },
        data: {
          tag: fixTag,
        },
      });
    }
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
