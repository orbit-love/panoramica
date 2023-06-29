/*
  Warnings:

  - You are about to drop the column `parentId` on the `Activity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceId,projectId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sourceId` on table `Activity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_parentId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "parentId",
ALTER COLUMN "sourceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Activity_sourceId_projectId_key" ON "Activity"("sourceId", "projectId");
