/*
  Warnings:

  - A unique constraint covering the columns `[pushToken]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `pushToken` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tipo` ENUM('avistamiento_nuevo', 'avistamiento_verificado', 'avistamiento_rechazado', 'gato_desaparecido', 'gato_nuevo', 'sistema') NOT NULL,
    `titulo` VARCHAR(120) NOT NULL,
    `descripcion` VARCHAR(300) NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `url` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_pushToken_key` ON `Usuario`(`pushToken`);

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;
