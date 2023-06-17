-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "source" TEXT,
ALTER COLUMN "sourceId" DROP NOT NULL;
