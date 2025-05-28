-- CreateTable
CREATE TABLE "Doctor" (
    "personId" TEXT NOT NULL PRIMARY KEY,
    "rizivNumber" TEXT NOT NULL,
    "isEnabledInShifts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Doctor_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_rizivNumber_key" ON "Doctor"("rizivNumber");
