/*
  Warnings:

  - You are about to drop the column `personId` on the `User` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_personId_fkey];

-- DropIndex
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_personId_key];

-- AlterTable
ALTER TABLE [dbo].[User] DROP COLUMN [personId];

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_id_fkey] FOREIGN KEY ([id]) REFERENCES [dbo].[Person]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
