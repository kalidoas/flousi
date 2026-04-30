-- Add Google OAuth fields to User
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- Add unique constraint for googleId
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

