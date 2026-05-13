/*
  Warnings:

  - You are about to alter the column `longitud` on the `Avistamiento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,1)` to `Decimal(10,7)`.
  - You are about to alter the column `latitud` on the `Avistamiento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,1)` to `Decimal(10,7)`.

*/
-- AlterTable
ALTER TABLE `Avistamiento` MODIFY `longitud` DECIMAL(10, 7) NOT NULL,
    MODIFY `latitud` DECIMAL(10, 7) NOT NULL;
