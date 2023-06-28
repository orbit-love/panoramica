-- DropIndex
DROP INDEX "Project_name_key";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "url" DROP NOT NULL;
