// prisma/seed.ts
//
// In package.json:
//   "prisma": { "seed": "ts-node prisma/seed.ts" }
//
// Run:
//   npx prisma db seed

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (tx) => {
    /* ------------------------------------------------------------------ *
     * 1. Persons                                                          *
     * ------------------------------------------------------------------ */
    const persons = [
      {
        id: '414756FA-F4A9-4908-B8AB-42982697585E',
        firstName: 'Filip',
        lastName: 'Smet',
        dateOfBirth: new Date('1969-04-08'),
        createdAt: new Date('2025-04-28T13:58:32.696Z'),
        updatedAt: new Date('2025-04-28T13:58:32.696Z'),
      },
      {
        id: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04',
        firstName: 'Isabeau',
        lastName: 'Verbelen',
        dateOfBirth: new Date('1990-07-04'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: '05B2122D-009F-4B8F-B010-2C8E84F2651B',
        firstName: 'Annemie',
        lastName: 'Van Ingelgem',
        dateOfBirth: new Date('1972-08-17'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: '37CFACDB-DD29-4125-BCD8-4E8F519D433E',
        firstName: 'Bert',
        lastName: 'Peeters',
        dateOfBirth: new Date('1990-10-11'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: 'D7FC6FD4-093A-46A6-94D2-520497754145',
        firstName: 'Tania',
        lastName: 'Decoster',
        dateOfBirth: new Date('1968-02-15'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: 'D722AB12-7D5B-4A12-989B-7DC23046822F',
        firstName: 'Koen',
        lastName: 'Hezemans',
        dateOfBirth: new Date('1990-06-19'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: 'C9E423E0-CE00-4CFA-8DCA-836010BE0EEA',
        firstName: 'Nathan',
        lastName: 'Van Hoeck',
        dateOfBirth: new Date('1991-06-20'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: 'C0255E85-86FA-478F-816E-C50C364D367F',
        firstName: 'Daphnée',
        lastName: 'Demaeght',
        dateOfBirth: new Date('1988-05-17'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: '234A95AC-713D-4B84-9702-D68D3E6D6E2B',
        firstName: 'Lennert',
        lastName: 'Poppeliers',
        dateOfBirth: new Date('1987-02-17'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: '3BE470D8-74B3-4C01-9E4F-EAE069F26B0A',
        firstName: 'Jef',
        lastName: 'Smet',
        dateOfBirth: new Date('2000-08-04'),
        createdAt: new Date('2025-04-28T13:31:02.392Z'),
        updatedAt: new Date('2025-04-28T13:31:02.392Z'),
      },
      {
        id: '6E7431EA-3439-408D-A514-EC9723204771',
        firstName: 'Goswin',
        lastName: 'Onsia',
        dateOfBirth: new Date('1989-08-03'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: 'C947B64E-E08D-4B0B-8827-F12C09C2469E',
        firstName: 'Evi',
        lastName: 'Van Den Kerckhove',
        dateOfBirth: new Date('1987-04-27'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        id: '2DD622E3-8DC0-4252-82D9-F39B5F93D0C2',
        firstName: 'Mark',
        lastName: 'Timmermans',
        dateOfBirth: new Date('1972-04-25'),
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
    ]

    for (const p of persons) {
      await tx.person.upsert({
        where: { id: p.id },
        update: { dateOfBirth: p.dateOfBirth },
        create: p,
      })
    }

    /* ------------------------------------------------------------------ *
     * 2. Roles                                                           *
     * ------------------------------------------------------------------ */
    const roles = [
      { id: 'c4074275-394f-4e3c-b6cd-208742851a02', name: 'admin' },
      { id: 'ec8de067-2638-4449-ac78-61513b449c47', name: 'user' },
    ]

    for (const r of roles) {
      await tx.role.upsert({
        where: { id: r.id },
        update: {},
        create: r,
      })
    }

    /* ------------------------------------------------------------------ *
     * 3. ShiftTypes                                                      *
     * ------------------------------------------------------------------ */
    const shiftTypes = [
      {
        id: '5192843E-DA72-4A5D-BB66-664716351EA9',
        name: 'nacht',
        startHour: 19,
        startMinute: 0,
        durationMinutes: 840,
        activeFrom: new Date('2000-01-01T00:00:00.000Z'),
        activeUntil: null,
        createdAt: new Date('2025-04-28T20:05:01.313Z'),
        updatedAt: new Date('2025-04-28T20:05:01.313Z'),
      },
      {
        id: 'C39ED775-592E-47BA-BCAD-87A08D9D554E',
        name: 'dag',
        startHour: 9,
        startMinute: 0,
        durationMinutes: 600,
        activeFrom: new Date('2000-01-01T00:00:00.000Z'),
        activeUntil: null,
        createdAt: new Date('2025-04-28T20:04:15.883Z'),
        updatedAt: new Date('2025-04-28T20:04:15.883Z'),
      },
      {
        id: '2A86B3C0-BA35-487C-B07B-EB3F72C5AD85',
        name: 'arts3',
        startHour: 11,
        startMinute: 0,
        durationMinutes: 720,
        activeFrom: new Date('2000-01-01T00:00:00.000Z'),
        activeUntil: null,
        createdAt: new Date('2025-04-28T20:05:38.627Z'),
        updatedAt: new Date('2025-04-28T20:05:38.627Z'),
      },
    ]

    for (const s of shiftTypes) {
      await tx.shiftType.upsert({
        where: { id: s.id },
        update: {},
        create: s,
      })
    }
  })

  console.log('✅  Database seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
