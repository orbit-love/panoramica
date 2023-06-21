-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "workspace" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;
