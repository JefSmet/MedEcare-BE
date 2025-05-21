import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const uppercaseFields: Record<string, string[]> = {
  Person: ['firstName', 'lastName'],
  Role: ['name'],
  ShiftType: ['name'],
  Activity: ['activityType', 'status'],
};

prisma.$use(async (params, next) => {
  if (['create', 'update', 'upsert'].includes(params.action)) {
    const fields = uppercaseFields[params.model ?? ''];
    if (fields && params.args?.data) {
      for (const field of fields) {
        const value = params.args.data[field];
        if (typeof value === 'string') {
          params.args.data[field] = value.toUpperCase();
        }
      }
    }
  }
  return next(params);
});

export default prisma;
