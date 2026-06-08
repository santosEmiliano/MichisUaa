/*
  Warnings:

  - You are about to alter the column `sexo` on the `Animal` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `Animal` MODIFY `sexo` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `refreshToken` VARCHAR(500) NULL;
