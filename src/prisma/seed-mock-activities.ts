// src/prisma/seed-mock-activities.ts
//
// This script creates mock activity data for shifts in months January through July 2025
// Run with: npx ts-node src/prisma/seed-mock-activities.ts

import { PrismaClient } from '@prisma/client';

console.log("Starting seed mock activities script...");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      // Helper functions
      function randomShiftId() {
        const shiftTypeIds = [
          '5192843E-DA72-4A5D-BB66-664716351EA9', // nacht
          'C39ED775-592E-47BA-BCAD-87A08D9D554E', // dag
          '2A86B3C0-BA35-487C-B07B-EB3F72C5AD85'  // arts3
        ];
        return shiftTypeIds[Math.floor(Math.random() * shiftTypeIds.length)];
      }

      function randomPersonId() {
        const personIds = [
          '414756FA-F4A9-4908-B8AB-42982697585E', // Filip Smet
          'C1335314-ABDE-47E9-A6E3-1E1D120D7B04', // Isabeau Verbelen
          '05B2122D-009F-4B8F-B010-2C8E84F2651B', // Annemie Van Ingelgem
          '37CFACDB-DD29-4125-BCD8-4E8F519D433E', // Bert Peeters
          'D7FC6FD4-093A-46A6-94D2-520497754145', // Tania Decoster
          'C9E423E0-CE00-4CFA-8DCA-836010BE0EEA', // Nathan Van Hoeck
          'C0255E85-86FA-478F-816E-C50C364D367F', // Daphnée Demaeght
          '234A95AC-713D-4B84-9702-D68D3E6D6E2B', // Lennert Poppeliers
          '6E7431EA-3439-408D-A514-EC9723204771', // Goswin Onsia
          'C947B64E-E08D-4B0B-8827-F12C09C2469E', // Evi Van Den Kerckhove
          '2DD622E3-8DC0-4252-82D9-F39B5F93D0C2'  // Mark Timmermans
        ];
        return personIds[Math.floor(Math.random() * personIds.length)];
      }

      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      function getDaysInMonth(year: number, month: number) {
        return new Date(year, month, 0).getDate();
      }

      function createShiftDate(year: number, month: number, day: number, shiftTypeId: string) {
        let startHour = 9; // Default for day shift
        let durationMinutes = 600; // Default for day shift (10 hours)
        
        if (shiftTypeId === '5192843E-DA72-4A5D-BB66-664716351EA9') { // nacht
          startHour = 19;
          durationMinutes = 840; // 14 hours
        } else if (shiftTypeId === '2A86B3C0-BA35-487C-B07B-EB3F72C5AD85') { // arts3
          startHour = 11;
          durationMinutes = 720; // 12 hours
        }
        
        const start = new Date(Date.UTC(year, month - 1, day, startHour, 0, 0));
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
        
        return { start, end };
      }

      // Generate activities for each month from January to July 2025
      const months = [1, 2, 3, 4, 5, 6, 7];
      const year = 2025;
      
      console.log("Starting mock data generation for activities...");
      let totalCreated = 0;

      for (const month of months) {
        // Delete existing activities for this month to avoid duplicates
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        
        const deleteCount1 = await tx.activity.deleteMany({
          where: {
            activityType: 'SHIFT',
            start: {
              gte: startDate,
              lte: endDate
            }
          }
        });
        console.log(`Deleted ${deleteCount1.count} existing SHIFTs for ${year}-${month}`);

        const deleteCount2 = await tx.activity.deleteMany({
          where: {
            activityType: 'shift',
            start: {
              gte: startDate,
              lte: endDate
            }
          }
        });
        console.log(`Deleted ${deleteCount2.count} existing shifts for ${year}-${month}`);
        
        // Calculate number of days in the month
        const daysInMonth = getDaysInMonth(year, month);
        
        // Generate activities (more in current month, fewer in others)
        const shiftsToCreate = month === 5 ? 40 : 15; // 40 for May, 15 for other months
        
        const activities = [];
        for (let i = 0; i < shiftsToCreate; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const personId = randomPersonId();
          const shiftTypeId = randomShiftId();
          const { start, end } = createShiftDate(year, month, day, shiftTypeId);
          
          activities.push({
            id: generateUUID(),
            activityType: 'SHIFT',
            start,
            end,
            status: 'SCHEDULED',
            personId,
            shiftTypeId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }        // Create activities one by one since createMany doesn't support skipDuplicates in SQLite
        let createdCount = 0;
        for (const activity of activities) {
          try {
            await tx.activity.create({
              data: activity,
            });
            createdCount++;
          } catch (err: any) {
            console.error(`Error creating activity: ${err.message}`);
          }
        }
          console.log(`Created ${createdCount} new shifts for ${year}-${month}`);
        totalCreated += createdCount;
      }

      console.log(`✅ Successfully generated ${totalCreated} mock activities across 7 months`);
    });
  } catch (error) {
    console.error('Error creating mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
