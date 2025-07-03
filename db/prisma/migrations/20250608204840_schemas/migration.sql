-- CreateTable
CREATE TABLE "Tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "min_freq_per_week" INTEGER NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taskslogs" (
    "id" BIGSERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "curr_status" BOOLEAN NOT NULL,

    CONSTRAINT "Taskslogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Taskslogs" ADD CONSTRAINT "Taskslogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
