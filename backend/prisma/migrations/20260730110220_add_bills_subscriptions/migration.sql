-- CreateTable
CREATE TABLE "BillSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryType" TEXT NOT NULL DEFAULT 'broadband',
    "provider" TEXT,
    "amount" REAL NOT NULL,
    "isAutoRecurring" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "dueDay" INTEGER NOT NULL DEFAULT 5,
    "paymentMode" TEXT NOT NULL DEFAULT 'upi',
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BillSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BillSubscription_userId_idx" ON "BillSubscription"("userId");
