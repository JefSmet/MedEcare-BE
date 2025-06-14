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
    // Helper function to add days to a date
    function addDays(date: Date, days: number): Date {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
    
    // Current date in demo format
    const today = new Date('2025-05-13T00:00:00.000Z');

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
        update: {
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth,
          updatedAt: p.updatedAt
        },
        create: p,
      })
    }

    /* ------------------------------------------------------------------ *
     * 2. Roles                                                           *
     * ------------------------------------------------------------------ */
    const roles = [
      { name: 'ADMIN' },
      { name: 'USER' },
    ]

    for (const r of roles) {
      await tx.role.upsert({
        where: { name: r.name }, // unique field 'name'
        update: {},
        create: r,
      })
    }

    /* ------------------------------------------------------------------ *
     * 2.1 Users                                                          *
     * ------------------------------------------------------------------ */
    const users = [
      {
        personId: '414756FA-F4A9-4908-B8AB-42982697585E', // Filip Smet
        email: 'filip.smet@medecare.be',
        password: '$2b$10$E2pPLwse9KRGh1.94WLW9.Sz7y9qHMytY0VHVbqcrMIIjSPke/oR.', // Test123!
        createdAt: new Date('2025-04-28T13:58:32.696Z'),
        updatedAt: new Date('2025-04-28T13:58:32.696Z'),
      },
      {
        personId: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04', // Isabeau Verbelen
        email: 'isabeau.verbelen@medecare.be',
        password: '$2b$10$E2pPLwse9KRGh1.94WLW9.Sz7y9qHMytY0VHVbqcrMIIjSPke/oR.', // Test123!
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
      {
        personId: '05B2122D-009F-4B8F-B010-2C8E84F2651B', // Annemie Van Ingelgem
        email: 'annemie.vaningelgem@medecare.be',
        password: '$2b$10$E2pPLwse9KRGh1.94WLW9.Sz7y9qHMytY0VHVbqcrMIIjSPke/oR.', // Test123!
        createdAt: new Date('2025-04-28T20:18:07.040Z'),
        updatedAt: new Date('2025-04-28T20:18:07.040Z'),
      },
    ]

    for (const u of users) {
      await tx.user.upsert({
        where: { personId: u.personId },
        update: {
          email: u.email,
          password: u.password,
          updatedAt: u.updatedAt
        },
        create: u,
      })
    }

    /* ------------------------------------------------------------------ *
     * 2.2 UserRoles                                                      *
     * ------------------------------------------------------------------ */
    const userRoles = [
      {
        userId: '414756FA-F4A9-4908-B8AB-42982697585E', // Filip Smet
        roleId: 'c4074275-394f-4e3c-b6cd-208742851a02', // admin
      },
      {
        userId: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04', // Isabeau Verbelen
        roleId: 'ec8de067-2638-4449-ac78-61513b449c47', // user
      },
      {
        userId: '05B2122D-009F-4B8F-B010-2C8E84F2651B', // Annemie Van Ingelgem
        roleId: 'ec8de067-2638-4449-ac78-61513b449c47', // user
      },
    ]

    for (const ur of userRoles) {
      await tx.userRole.upsert({
        where: { 
          userId_roleId: {
            userId: ur.userId,
            roleId: ur.roleId,
          } 
        },
        update: {},
        create: ur,
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
        update: {
          name: s.name,
          startHour: s.startHour,
          startMinute: s.startMinute,
          durationMinutes: s.durationMinutes,
          activeFrom: s.activeFrom,
          activeUntil: s.activeUntil,
          updatedAt: s.updatedAt
        },
        create: s,
      })
    }

    /* ------------------------------------------------------------------ *
     * 4. ShiftTypeRates                                                  *
     * ------------------------------------------------------------------ */
    const shiftTypeRates = [
      {
        id: '6A84C9F2-1FBD-4C8E-9E69-0A3A3E9E0D7B',
        shiftTypeId: '5192843E-DA72-4A5D-BB66-664716351EA9', // nacht
        rate: 85.0,
        validFrom: new Date('2025-01-01T00:00:00.000Z'),
        validUntil: null,
        createdAt: new Date('2025-04-28T20:10:01.313Z'),
        updatedAt: new Date('2025-04-28T20:10:01.313Z'),
      },
      {
        id: 'B3D9C2E7-4A1F-4E3B-8C9D-2E5F7A1B3D6C',
        shiftTypeId: 'C39ED775-592E-47BA-BCAD-87A08D9D554E', // dag
        rate: 65.0,
        validFrom: new Date('2025-01-01T00:00:00.000Z'),
        validUntil: null,
        createdAt: new Date('2025-04-28T20:10:15.883Z'),
        updatedAt: new Date('2025-04-28T20:10:15.883Z'),
      },
      {
        id: 'F1E2D3C4-B5A6-7C8D-9E0F-1A2B3C4D5E6F',
        shiftTypeId: '2A86B3C0-BA35-487C-B07B-EB3F72C5AD85', // arts3
        rate: 75.0,
        validFrom: new Date('2025-01-01T00:00:00.000Z'),
        validUntil: null,
        createdAt: new Date('2025-04-28T20:10:38.627Z'),
        updatedAt: new Date('2025-04-28T20:10:38.627Z'),
      },
    ]

    for (const r of shiftTypeRates) {
      await tx.shiftTypeRate.upsert({
        where: { id: r.id },
        update: {
          shiftTypeId: r.shiftTypeId,
          rate: r.rate,
          validFrom: r.validFrom,
          validUntil: r.validUntil,
          updatedAt: r.updatedAt
        },
        create: r,
      })
    }

    /* ------------------------------------------------------------------ *
     * 5. Activities (Shifts & Leave)                                     *
     * ------------------------------------------------------------------ */
    const activities = [
      {
        id: 'A1B2C3D4-E5F6-4A5B-8C9D-7E8F9G0H1I2J',
        activityType: 'SHIFT',
        start: addDays(today, 0),
        end: addDays(today, 1),
        status: 'SCHEDULED',
        personId: '414756FA-F4A9-4908-B8AB-42982697585E',
        shiftTypeId: 'C39ED775-592E-47BA-BCAD-87A08D9D554E',
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'B2C3D4E5-F6G7-5B6C-9D0E-8F9G0H1I2J3K',
        activityType: 'SHIFT',
        start: addDays(today, 2),
        end: addDays(today, 3),
        status: 'SCHEDULED',
        personId: '414756FA-F4A9-4908-B8AB-42982697585E',
        shiftTypeId: 'C39ED775-592E-47BA-BCAD-87A08D9D554E',
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'C3D4E5F6-G7H8-6C7D-0E1F-9G0H1I2J3K4L',
        activityType: 'SHIFT',
        start: addDays(today, 0),
        end: addDays(today, 1),
        status: 'SCHEDULED',
        personId: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04',
        shiftTypeId: '5192843E-DA72-4A5D-BB66-664716351EA9',
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'D4E5F6G7-H8I9-7D8E-1F2G-0H1I2J3K4L5M',
        activityType: 'SHIFT',
        start: addDays(today, 3),
        end: addDays(today, 4),
        status: 'SCHEDULED',
        personId: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04',
        shiftTypeId: '5192843E-DA72-4A5D-BB66-664716351EA9',
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'E5F6G7H8-I9J0-8E9F-2G3H-1I2J3K4L5M6N',
        activityType: 'SHIFT',
        start: addDays(today, 1),
        end: addDays(today, 2),
        status: 'SCHEDULED',
        personId: '05B2122D-009F-4B8F-B010-2C8E84F2651B',
        shiftTypeId: '2A86B3C0-BA35-487C-B07B-EB3F72C5AD85',
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'F6G7H8I9-J0K1-9F0G-3H4I-2J3K4L5M6N7O',
        activityType: 'LEAVE',
        start: addDays(today, 7),
        end: addDays(today, 14),
        status: 'APPROVED',
        personId: '05B2122D-009F-4B8F-B010-2C8E84F2651B',
        shiftTypeId: null,
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'G7H8I9J0-K1L2-0G1H-4I5J-3K4L5M6N7O8P',
        activityType: 'SHIFT',
        start: addDays(today, 0),
        end: addDays(today, 1),
        status: 'SCHEDULED',
        personId: '37CFACDB-DD29-4125-BCD8-4E8F519D433E',
        shiftTypeId: '2A86B3C0-BA35-487C-B07B-EB3F72C5AD85',
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      }
    ]
    
    for (const a of activities) {
      await tx.activity.upsert({
        where: { id: a.id },
        update: {},
        create: a,
      })
    }

    /* ------------------------------------------------------------------ *
     * 6. User Constraints                                                *
     * ------------------------------------------------------------------ */
    const userConstraints = [
      {
        id: 'H8I9J0K1-L2M3-1H2I-5J6K-4L5M6N7O8P9Q',
        personId: '414756FA-F4A9-4908-B8AB-42982697585E', // Filip Smet
        maxNightShiftsPerWeek: 2,
        maxConsecutiveNightShifts: 3,
        minRestHoursBetweenShifts: 12,
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
      {
        id: 'I9J0K1L2-M3N4-2I3J-6K7L-5M6N7O8P9Q0R',
        personId: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04', // Isabeau Verbelen
        maxNightShiftsPerWeek: 3,
        maxConsecutiveNightShifts: 4,
        minRestHoursBetweenShifts: 10,
        createdAt: new Date('2025-05-01T20:00:00.000Z'),
        updatedAt: new Date('2025-05-01T20:00:00.000Z'),
      },
    ]

    for (const uc of userConstraints) {
      await tx.userConstraint.upsert({
        where: { id: uc.id },
        update: {},
        create: uc,
      })
    }

    /* ------------------------------------------------------------------ *
     * 7. Doctors                                                        *
     * ------------------------------------------------------------------ */
    const doctors = [
      { personId: '414756FA-F4A9-4908-B8AB-42982697585E', rizivNumber: '17276985800' },
      { personId: '2DD622E3-8DC0-4252-82D9-F39B5F93D0C2', rizivNumber: '10960901900' },
      { personId: 'D7FC6FD4-093A-46A6-94D2-520497754145', rizivNumber: '11758675149' },
      { personId: '05B2122D-009F-4B8F-B010-2C8E84F2651B', rizivNumber: '14784679800' },
      { personId: 'C0255E85-86FA-478F-816E-C50C364D367F', rizivNumber: '13807850900' },
      { personId: '234A95AC-713D-4B84-9702-D68D3E6D6E2B', rizivNumber: '14979669109' },
      { personId: 'C947B64E-E08D-4B0B-8827-F12C09C2469E', rizivNumber: '14978778900' },
      { personId: 'C1335314-ABDE-47E9-A6E3-1E1D120D7B04', rizivNumber: '19997341900' },
      { personId: '6E7431EA-3439-408D-A514-EC9723204771', rizivNumber: '13828042900' },
      { personId: '37CFACDB-DD29-4125-BCD8-4E8F519D433E', rizivNumber: '13869119900' },
      { personId: 'D722AB12-7D5B-4A12-989B-7DC23046822F', rizivNumber: '13895942900' },
      { personId: 'C9E423E0-CE00-4CFA-8DCA-836010BE0EEA', rizivNumber: '13879611900' },
    ]

    for (const d of doctors) {
      await tx.doctor.upsert({
        where: { personId: d.personId },
        update: {
          rizivNumber: d.rizivNumber,
          updatedAt: new Date(),
        },
        create: {
          personId: d.personId,
          rizivNumber: d.rizivNumber,
          isEnabledInShifts: d.personId === 'D722AB12-7D5B-4A12-989B-7DC23046822F' ? false : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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
