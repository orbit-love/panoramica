/*
  Warnings:

  - You are about to drop the column `orbit_id` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sourceId,simulationId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Activity_orbit_id_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "orbit_id",
ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "entities" JSONB,
ADD COLUMN     "globalActor" TEXT,
ADD COLUMN     "globalActorName" TEXT,
ADD COLUMN     "mentions" JSONB,
ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "sourceType" TEXT,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "textHtml" TEXT,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "payload" DROP NOT NULL;

-- DropTable
DROP TABLE "Member";

-- CreateIndex
CREATE UNIQUE INDEX "Activity_sourceId_simulationId_key" ON "Activity"("sourceId", "simulationId");
