import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // минимальный сид, пусто по умолчанию
  console.log('Seed: nothing to seed by default.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
