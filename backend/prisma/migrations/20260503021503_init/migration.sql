-- CreateTable
CREATE TABLE `Colonia` (
    `idColonia` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(400) NOT NULL,
    `zona` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idColonia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Animal` (
    `idAnimal` INTEGER NOT NULL AUTO_INCREMENT,
    `Colonia_idColonia` INTEGER NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `esterilizado` BOOLEAN NOT NULL DEFAULT false,
    `foto` VARCHAR(120) NULL,
    `estado` ENUM('Desaparecido', 'Registrado', 'NoRegistrado') NOT NULL DEFAULT 'Registrado',
    `fecha_nac` DATETIME(3) NULL,
    `fecha_esterilizacion` DATETIME(3) NULL,
    `descripcion` VARCHAR(400) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idAnimal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(90) NOT NULL,
    `email` VARCHAR(80) NOT NULL,
    `password` VARCHAR(150) NOT NULL,
    `admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario-Col` (
    `Colonia_idColonia` INTEGER NOT NULL,
    `Usuario_idUsuario` INTEGER NOT NULL,

    PRIMARY KEY (`Colonia_idColonia`, `Usuario_idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Avistamiento` (
    `idAvistamiento` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `animalId` INTEGER NULL,
    `verificadoPor` INTEGER NULL,
    `foto` VARCHAR(150) NULL,
    `descripcion` VARCHAR(400) NULL,
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `longitud` DECIMAL(9, 1) NOT NULL,
    `latitud` DECIMAL(9, 1) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idAvistamiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Animal` ADD CONSTRAINT `Animal_Colonia_idColonia_fkey` FOREIGN KEY (`Colonia_idColonia`) REFERENCES `Colonia`(`idColonia`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario-Col` ADD CONSTRAINT `Usuario-Col_Colonia_idColonia_fkey` FOREIGN KEY (`Colonia_idColonia`) REFERENCES `Colonia`(`idColonia`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario-Col` ADD CONSTRAINT `Usuario-Col_Usuario_idUsuario_fkey` FOREIGN KEY (`Usuario_idUsuario`) REFERENCES `Usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avistamiento` ADD CONSTRAINT `Avistamiento_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avistamiento` ADD CONSTRAINT `Avistamiento_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`idAnimal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avistamiento` ADD CONSTRAINT `Avistamiento_verificadoPor_fkey` FOREIGN KEY (`verificadoPor`) REFERENCES `Usuario`(`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE;
