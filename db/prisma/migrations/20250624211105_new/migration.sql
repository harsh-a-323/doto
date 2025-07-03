/*
  Warnings:

  - Added the required column `creation_time` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "creation_time" TIMESTAMP(3) NOT NULL;
