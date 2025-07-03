/*
  Warnings:

  - Added the required column `update_time` to the `Taskslogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Taskslogs" ADD COLUMN     "update_time" TIMESTAMP(3) NOT NULL;
