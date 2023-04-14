import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user1 = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@admin.com',
      password:
        '3a3be539664b07f077bff61c4c0e5d5d1309e51c3db7114d39770782ba24c06e',
      hash: 'd85d0cc43320680cfbd13cb6eb8eff58',
      emailVerifiedAt: null,
      profile: {
        create: {
          avatarUrl:
            'https://secure.gravatar.com/avatar/3dd6b9265ff18f31dc30df59304b0ca7?d=https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/initials/SA-5.png',
          firstName: 'Super',
          lastName: 'Admin',
        },
      },
    },
  });
  console.log({ user1 });
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
