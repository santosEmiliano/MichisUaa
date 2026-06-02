/*
  Warnings:

  - You are about to drop the column `foto_id` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `foto_id` on the `Avistamiento` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE `Animal` DROP COLUMN `foto_id`;

-- AlterTable
ALTER TABLE `Avistamiento` DROP COLUMN `foto_id`;
