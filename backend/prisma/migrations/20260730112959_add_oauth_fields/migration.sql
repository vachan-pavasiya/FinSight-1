-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "githubId" TEXT,
    "facebookId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "profilePicture" TEXT,
    "emailVerifyToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerifyToken", "id", "isEmailVerified", "name", "password", "resetPasswordExpiry", "resetPasswordToken", "role", "updatedAt") SELECT "createdAt", "email", "emailVerifyToken", "id", "isEmailVerified", "name", "password", "resetPasswordExpiry", "resetPasswordToken", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
