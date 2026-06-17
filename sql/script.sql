-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema barb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema barb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `barb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `barb` ;

-- -----------------------------------------------------
-- Table `barb`.`clientes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`clientes` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `senha` VARCHAR(150) NOT NULL,
  `celular` CHAR(13) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) ,
  UNIQUE INDEX `celular_UNIQUE` (`celular` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`empresas` (
  `id_empresa` INT NOT NULL AUTO_INCREMENT,
  `codigo_empresa` CHAR(4) NOT NULL,
  `nome` VARCHAR(200) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_empresa`))
ENGINE = InnoDB
AUTO_INCREMENT = 121
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`grupos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`grupos` (
  `id_grupo` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_grupo`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`colaboradores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`colaboradores` (
  `id_colaborador` INT NOT NULL AUTO_INCREMENT,
  `id_empresa` INT NOT NULL,
  `id_grupo` INT NOT NULL,
  `nome` VARCHAR(150) NOT NULL,
  `login` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(200) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_colaborador`),
  UNIQUE INDEX `login_UNIQUE` (`login` ASC) ,
  INDEX `fk_colaboradores_grupos_idx` (`id_grupo` ASC) ,
  INDEX `fk_colaboradores_empresas_idx` (`id_empresa` ASC) ,
  CONSTRAINT `fk_colaboradores_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`),
  CONSTRAINT `fk_colaboradores_grupos`
    FOREIGN KEY (`id_grupo`)
    REFERENCES `barb`.`grupos` (`id_grupo`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`acessos_tokens`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`acessos_tokens` (
  `id_token` INT NOT NULL AUTO_INCREMENT,
  `id_colaborador` INT NULL DEFAULT NULL,
  `id_cliente` INT NULL DEFAULT NULL,
  `refresh_token` VARCHAR(150) NOT NULL,
  `origem` VARCHAR(50) NOT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_token`),
  UNIQUE INDEX `refresh_token_UNIQUE` (`refresh_token` ASC) ,
  INDEX `fk_tokens_colaboradores_idx` (`id_colaborador` ASC) ,
  INDEX `fk_tokens_clientes_idx` (`id_cliente` ASC) ,
  CONSTRAINT `fk_tokens_clientes`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `barb`.`clientes` (`id_cliente`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_tokens_colaboradores`
    FOREIGN KEY (`id_colaborador`)
    REFERENCES `barb`.`colaboradores` (`id_colaborador`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`filiais`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`filiais` (
  `id_filial` INT NOT NULL AUTO_INCREMENT,
  `id_empresa` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `endereco` VARCHAR(100) NOT NULL,
  `bairro` VARCHAR(100) NOT NULL,
  `cidade` VARCHAR(100) NOT NULL,
  `uf` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_filial`),
  INDEX `fk_filiais_empresas_idx` (`id_empresa` ASC) ,
  CONSTRAINT `fk_filiais_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`agendamentos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`agendamentos` (
  `id_agendamento` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NULL DEFAULT NULL,
  `id_colaborador` INT NOT NULL,
  `id_filial` INT NOT NULL,
  `data_hora` DATETIME NOT NULL,
  `origem` TINYINT NOT NULL DEFAULT '1',
  `status` TINYINT NOT NULL DEFAULT '0',
  `total` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_agendamento`),
  INDEX `fk_agendamentos_clientes_idx` (`id_cliente` ASC) ,
  INDEX `fk_agendamentos_colaboradores_idx` (`id_colaborador` ASC) ,
  INDEX `fk_agendamentos_filiais_idx` (`id_filial` ASC) ,
  CONSTRAINT `fk_agendamentos_clientes`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `barb`.`clientes` (`id_cliente`),
  CONSTRAINT `fk_agendamentos_colaboradores`
    FOREIGN KEY (`id_colaborador`)
    REFERENCES `barb`.`colaboradores` (`id_colaborador`),
  CONSTRAINT `fk_agendamentos_filiais`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`servicos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`servicos` (
  `id_servico` INT NOT NULL AUTO_INCREMENT,
  `id_filial` INT NOT NULL,
  `peso` DOUBLE NOT NULL,
  `nome` VARCHAR(150) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_servico`),
  INDEX `fk_servicos_filial_idx` (`id_filial` ASC) ,
  CONSTRAINT `fk_servicos_filial`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`agendamentos_servicos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`agendamentos_servicos` (
  `id_agendamento_servico` INT NOT NULL AUTO_INCREMENT,
  `id_agendamento` INT NOT NULL,
  `id_servico` INT NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_agendamento_servico`),
  INDEX `fk_agendamentos_servicos_servicos_idx` (`id_servico` ASC) ,
  INDEX `fk_agendamentos_agendamentos_idx` (`id_agendamento` ASC) ,
  CONSTRAINT `fk_agendamentos_agendamentos`
    FOREIGN KEY (`id_agendamento`)
    REFERENCES `barb`.`agendamentos` (`id_agendamento`),
  CONSTRAINT `fk_agendamentos_servicos_servicos`
    FOREIGN KEY (`id_servico`)
    REFERENCES `barb`.`servicos` (`id_servico`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`clientes_empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`clientes_empresas` (
  `id_cliente_empresa` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `id_empresa` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_cliente_empresa`),
  INDEX `fk_clientes_empresas_empresas_idx` (`id_empresa` ASC) ,
  INDEX `fk_clientes_empresas_clientes_idx` (`id_cliente` ASC) ,
  CONSTRAINT `fk_clientes_empresas_clientes`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `barb`.`clientes` (`id_cliente`),
  CONSTRAINT `fk_clientes_empresas_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`filiais_colaboradores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`filiais_colaboradores` (
  `id_filial_colaborador` INT NOT NULL AUTO_INCREMENT,
  `id_filial` INT NOT NULL,
  `id_colaborador` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_filial_colaborador`),
  INDEX `fk_filiais_colaboradores_colaboradores_idx` (`id_colaborador` ASC) ,
  INDEX `fk_filiais_colaboradores_filiais_idx` (`id_filial` ASC) ,
  CONSTRAINT `fk_filiais_colaboradores_colaboradores`
    FOREIGN KEY (`id_colaborador`)
    REFERENCES `barb`.`colaboradores` (`id_colaborador`),
  CONSTRAINT `fk_filiais_colaboradores_filiais`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`parametros_empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`parametros_empresas` (
  `id_parametro_empresa` INT NOT NULL AUTO_INCREMENT,
  `id_empresa` INT NOT NULL,
  `tempo_agendamento` INT NULL DEFAULT NULL,
  `tempo_intervalo` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_parametro_empresa`),
  INDEX `fk_parametros_empresas_empresas_idx` (`id_empresa` ASC) ,
  CONSTRAINT `fk_parametros_empresas_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`parametros_filiais_colaboradores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`parametros_filiais_colaboradores` (
  `id_parametro_filial_colaborador` INT NOT NULL AUTO_INCREMENT,
  `id_filial_colaborador` INT NOT NULL,
  `tempo_agendamento` INT NULL DEFAULT NULL,
  `tempo_intervalo` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_parametro_filial_colaborador`),
  INDEX `fk_parametros_filiais_colaboradores_filiais_colaboradores_idx` (`id_filial_colaborador` ASC) ,
  CONSTRAINT `fk_parametros_filiais_colaboradores_filiais_colaboradores`
    FOREIGN KEY (`id_filial_colaborador`)
    REFERENCES `barb`.`filiais_colaboradores` (`id_filial_colaborador`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `barb`.`parametros_filial`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`parametros_filial` (
  `id_parametro_filial` INT NOT NULL AUTO_INCREMENT,
  `id_filial` INT NOT NULL,
  `tempo_agendamento` INT NULL DEFAULT NULL,
  `tempo_intervalo` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_parametro_filial`),
  INDEX `fk_parametros_filiais_filiais_idx` (`id_filial` ASC) ,
  CONSTRAINT `fk_parametros_filiais_filiais`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
