let prismaInstance;

function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = require('@prisma/client').PrismaClient;
    prismaInstance = new prismaInstance();
  }
  return prismaInstance;
}

module.exports = {
  getPrisma
};
