-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "love" INTEGER,
    "reach" INTEGER,
    "level" INTEGER,
    "first_activity_at" TIMESTAMP(3) NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "orbit_id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "simulationId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_slug_key" ON "Member"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_name_key" ON "Simulation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_orbit_id_key" ON "Activity"("orbit_id");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

