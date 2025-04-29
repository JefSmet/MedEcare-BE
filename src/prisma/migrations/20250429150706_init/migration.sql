BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Person] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Person_id_df] DEFAULT newsequentialid(),
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [dateOfBirth] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Person_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Person_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [personId] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [resetToken] NVARCHAR(1000),
    [resetExpire] DATETIME2,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([personId]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Role_id_df] DEFAULT newsequentialid(),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[UserRole] (
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [roleId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [UserRole_pkey] PRIMARY KEY CLUSTERED ([userId],[roleId])
);

-- CreateTable
CREATE TABLE [dbo].[RefreshToken] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [RefreshToken_id_df] DEFAULT newsequentialid(),
    [token] NVARCHAR(1000) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RefreshToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RefreshToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RefreshToken_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[ShiftType] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [ShiftType_id_df] DEFAULT newsequentialid(),
    [name] NVARCHAR(1000) NOT NULL,
    [startHour] INT NOT NULL,
    [startMinute] INT NOT NULL,
    [durationMinutes] INT NOT NULL,
    [activeFrom] DATETIME2,
    [activeUntil] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ShiftType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShiftType_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ShiftTypeRate] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [ShiftTypeRate_id_df] DEFAULT newsequentialid(),
    [shiftTypeId] UNIQUEIDENTIFIER NOT NULL,
    [rate] FLOAT(53) NOT NULL,
    [validFrom] DATETIME2 NOT NULL,
    [validUntil] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ShiftTypeRate_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShiftTypeRate_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Activity] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Activity_id_df] DEFAULT newsequentialid(),
    [activityType] NVARCHAR(1000) NOT NULL,
    [start] DATETIME2 NOT NULL,
    [end] DATETIME2 NOT NULL,
    [personId] UNIQUEIDENTIFIER NOT NULL,
    [shiftTypeId] UNIQUEIDENTIFIER,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Activity_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Activity_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserConstraint] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [UserConstraint_id_df] DEFAULT newsequentialid(),
    [personId] UNIQUEIDENTIFIER NOT NULL,
    [maxNightShiftsPerWeek] INT,
    [maxConsecutiveNightShifts] INT,
    [minRestHoursBetweenShifts] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserConstraint_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserConstraint_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_personId_fkey] FOREIGN KEY ([personId]) REFERENCES [dbo].[Person]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([personId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RefreshToken] ADD CONSTRAINT [RefreshToken_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([personId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShiftTypeRate] ADD CONSTRAINT [ShiftTypeRate_shiftTypeId_fkey] FOREIGN KEY ([shiftTypeId]) REFERENCES [dbo].[ShiftType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Activity] ADD CONSTRAINT [Activity_personId_fkey] FOREIGN KEY ([personId]) REFERENCES [dbo].[Person]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Activity] ADD CONSTRAINT [Activity_shiftTypeId_fkey] FOREIGN KEY ([shiftTypeId]) REFERENCES [dbo].[ShiftType]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserConstraint] ADD CONSTRAINT [UserConstraint_personId_fkey] FOREIGN KEY ([personId]) REFERENCES [dbo].[Person]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
