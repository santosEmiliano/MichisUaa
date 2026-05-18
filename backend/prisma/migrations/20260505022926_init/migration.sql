-- DropForeignKey
ALTER TABLE `Avistamiento` DROP FOREIGN KEY `Avistamiento_usuarioId_fkey`;

-- DropIndex
DROP INDEX `Avistamiento_usuarioId_fkey` ON `Avistamiento`;

-- AddForeignKey
ALTER TABLE `Avistamiento` ADD CONSTRAINT `Avistamiento_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;
