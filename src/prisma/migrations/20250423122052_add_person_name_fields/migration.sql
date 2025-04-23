/*
  Warnings:

  - Made the column `firstName` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Person] ALTER COLUMN [firstName] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[Person] ALTER COLUMN [lastName] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[Person] ADD [dateOfBirth] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
