/*
  Warnings:

  - You are about to drop the column `foto` on the `Animal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Animal` DROP COLUMN `foto`,
    ADD COLUMN `foto_id` VARCHAR(160) NULL,
    ADD COLUMN `foto_url` VARCHAR(160) NULL;
