-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema barb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema barb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `barb` DEFAULT CHARACTER SET utf8 ;
USE `barb` ;

-- -----------------------------------------------------
-- Table `barb`.`empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`empresas` (
  `id_empresa` INT NOT NULL AUTO_INCREMENT,
  `codigo_empresa` CHAR(4) NOT NULL,
  `nome` VARCHAR(200) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_empresa`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`cargos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`cargos` (
  `id_cargo` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_cargo`))
ENGINE = InnoDB;


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
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_filial`),
  INDEX `fk_filiais_empresas_idx` (`id_empresa` ASC),
  CONSTRAINT `fk_filiais_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


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
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_servico`),
  INDEX `fk_servicos_filial_idx` (`id_filial` ASC),
  CONSTRAINT `fk_servicos_filial`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`clientes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`clientes` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `senha` VARCHAR(150) NOT NULL,
  `celular` CHAR(13) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `celular_UNIQUE` (`celular` ASC)
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`clientes_empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`clientes_empresas` (
  `id_cliente_empresa` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `id_empresa` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_cliente_empresa`),
  INDEX `fk_clientes_empresas_empresas_idx` (`id_empresa` ASC),
  INDEX `fk_clientes_empresas_clientes_idx` (`id_cliente` ASC),
  CONSTRAINT `fk_clientes_empresas_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_clientes_empresas_clientes`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `barb`.`clientes` (`id_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`colaboradores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`colaboradores` (
  `id_colaborador` INT NOT NULL AUTO_INCREMENT,
  `id_empresa` INT NOT NULL,
  `id_cargo` INT NOT NULL,
  `login` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(200) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_colaborador`),
  INDEX `fk_colaboradores_cargos_idx` (`id_cargo` ASC),
  INDEX `fk_colaboradores_empresas_idx` (`id_empresa` ASC),
  UNIQUE INDEX `login_UNIQUE` (`login` ASC),
  CONSTRAINT `fk_colaboradores_cargos`
    FOREIGN KEY (`id_cargo`)
    REFERENCES `barb`.`cargos` (`id_cargo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_colaboradores_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`filiais_colaboradores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`filiais_colaboradores` (
  `id_filial_colaborador` INT NOT NULL AUTO_INCREMENT,
  `id_filial` INT NOT NULL,
  `id_colaborador` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_filial_colaborador`),
  INDEX `fk_filiais_colaboradores_colaboradores_idx` (`id_colaborador` ASC),
  INDEX `fk_filiais_colaboradores_filiais_idx` (`id_filial` ASC),
  CONSTRAINT `fk_filiais_colaboradores_colaboradores`
    FOREIGN KEY (`id_colaborador`)
    REFERENCES `barb`.`colaboradores` (`id_colaborador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_filiais_colaboradores_filiais`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`agendamentos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`agendamentos` (
  `id_agendamento` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NULL,
  `id_colaborador` INT NOT NULL,
  `id_filial` INT NOT NULL,
  `data_hora` DATETIME NOT NULL,
  `origem` TINYINT NOT NULL DEFAULT 1,
  `status` TINYINT NOT NULL DEFAULT 0,
  `total` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_agendamento`),
  INDEX `fk_agendamentos_clientes_idx` (`id_cliente` ASC),
  INDEX `fk_agendamentos_colaboradores_idx` (`id_colaborador` ASC),
  INDEX `fk_agendamentos_filiais_idx` (`id_filial` ASC),
  CONSTRAINT `fk_agendamentos_clientes`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `barb`.`clientes` (`id_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_agendamentos_colaboradores`
    FOREIGN KEY (`id_colaborador`)
    REFERENCES `barb`.`colaboradores` (`id_colaborador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_agendamentos_filiais`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


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
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_agendamento_servico`),
  INDEX `fk_agendamentos_servicos_servicos_idx` (`id_servico` ASC),
  INDEX `fk_agendamentos_agendamentos_idx` (`id_agendamento` ASC),
  CONSTRAINT `fk_agendamentos_servicos_servicos`
    FOREIGN KEY (`id_servico`)
    REFERENCES `barb`.`servicos` (`id_servico`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_agendamentos_agendamentos`
    FOREIGN KEY (`id_agendamento`)
    REFERENCES `barb`.`agendamentos` (`id_agendamento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`parametros_empresas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`parametros_empresas` (
  `id_parametro_empresa` INT NOT NULL AUTO_INCREMENT,
  `id_empresa` INT NOT NULL,
  `tempo_agendamento` INT NULL,
  `tempo_intervalo` INT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_parametro_empresa`),
  INDEX `fk_parametros_empresas_empresas_idx` (`id_empresa` ASC),
  CONSTRAINT `fk_parametros_empresas_empresas`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `barb`.`empresas` (`id_empresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`parametros_filiais_colaboradores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`parametros_filiais_colaboradores` (
  `id_parametro_filial_colaborador` INT NOT NULL AUTO_INCREMENT,
  `id_filial_colaborador` INT NOT NULL,
  `tempo_agendamento` INT NULL,
  `tempo_intervalo` INT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_parametro_filial_colaborador`),
  INDEX `fk_parametros_filiais_colaboradores_filiais_colaboradores_idx` (`id_filial_colaborador` ASC),
  CONSTRAINT `fk_parametros_filiais_colaboradores_filiais_colaboradores`
    FOREIGN KEY (`id_filial_colaborador`)
    REFERENCES `barb`.`filiais_colaboradores` (`id_filial_colaborador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `barb`.`parametros_filial`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `barb`.`parametros_filial` (
  `id_parametro_filial` INT NOT NULL AUTO_INCREMENT,
  `id_filial` INT NOT NULL,
  `tempo_agendamento` INT NULL,
  `tempo_intervalo` INT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id_parametro_filial`),
  INDEX `fk_parametros_filiais_filiais_idx` (`id_filial` ASC),
  CONSTRAINT `fk_parametros_filiais_filiais`
    FOREIGN KEY (`id_filial`)
    REFERENCES `barb`.`filiais` (`id_filial`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
