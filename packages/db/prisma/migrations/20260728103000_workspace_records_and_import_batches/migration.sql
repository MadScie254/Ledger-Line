-- CreateTable
CREATE TABLE "WorkspaceRecord" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "status" TEXT,
    "amountMinor" INTEGER,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "successRows" INTEGER NOT NULL,
    "failedRows" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdRecordIds" JSONB NOT NULL,
    "importedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedAt" TIMESTAMP(3),

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceRecord_orgId_moduleKey_createdAt_idx" ON "WorkspaceRecord"("orgId", "moduleKey", "createdAt");

-- CreateIndex
CREATE INDEX "ImportBatch_orgId_targetType_createdAt_idx" ON "ImportBatch"("orgId", "targetType", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkspaceRecord" ADD CONSTRAINT "WorkspaceRecord_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
