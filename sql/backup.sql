-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: barb
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `acessos_tokens`
--

DROP TABLE IF EXISTS `acessos_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acessos_tokens` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `id_colaborador` int DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_empresa` int DEFAULT NULL,
  `refresh_token` varchar(150) NOT NULL,
  `origem` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `refresh_token_UNIQUE` (`refresh_token`),
  KEY `fk_tokens_colaboradores_idx` (`id_colaborador`),
  KEY `fk_tokens_clientes_idx` (`id_cliente`),
  KEY `fk_tokens_empresas_idx` (`id_empresa`),
  CONSTRAINT `fk_tokens_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE,
  CONSTRAINT `fk_tokens_colaboradores` FOREIGN KEY (`id_colaborador`) REFERENCES `colaboradores` (`id_colaborador`) ON DELETE CASCADE,
  CONSTRAINT `fk_tokens_empresas` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acessos_tokens`
--

LOCK TABLES `acessos_tokens` WRITE;
/*!40000 ALTER TABLE `acessos_tokens` DISABLE KEYS */;
INSERT INTO `acessos_tokens` VALUES (64,NULL,1,NULL,'e2dbd1bf5893da1dcc4ec3544981cd81a7460db30d941f2c31be7c0fbfc9a00c','web','172.18.0.1','2026-07-22 22:31:28','2026-06-22 22:31:28');
/*!40000 ALTER TABLE `acessos_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `id_agendamento` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int DEFAULT NULL,
  `id_colaborador` int NOT NULL,
  `id_filial` int NOT NULL,
  `data_hora` datetime NOT NULL,
  `origem` tinyint NOT NULL DEFAULT '1',
  `status` tinyint NOT NULL DEFAULT '0',
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_agendamento`),
  KEY `fk_agendamentos_clientes_idx` (`id_cliente`),
  KEY `fk_agendamentos_colaboradores_idx` (`id_colaborador`),
  KEY `fk_agendamentos_filiais_idx` (`id_filial`),
  CONSTRAINT `fk_agendamentos_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `fk_agendamentos_colaboradores` FOREIGN KEY (`id_colaborador`) REFERENCES `colaboradores` (`id_colaborador`),
  CONSTRAINT `fk_agendamentos_filiais` FOREIGN KEY (`id_filial`) REFERENCES `filiais` (`id_filial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos`
--

LOCK TABLES `agendamentos` WRITE;
/*!40000 ALTER TABLE `agendamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `agendamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agendamentos_servicos`
--

DROP TABLE IF EXISTS `agendamentos_servicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos_servicos` (
  `id_agendamento_servico` int NOT NULL AUTO_INCREMENT,
  `id_agendamento` int NOT NULL,
  `id_servico` int NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_agendamento_servico`),
  KEY `fk_agendamentos_servicos_servicos_idx` (`id_servico`),
  KEY `fk_agendamentos_agendamentos_idx` (`id_agendamento`),
  CONSTRAINT `fk_agendamentos_agendamentos` FOREIGN KEY (`id_agendamento`) REFERENCES `agendamentos` (`id_agendamento`),
  CONSTRAINT `fk_agendamentos_servicos_servicos` FOREIGN KEY (`id_servico`) REFERENCES `servicos` (`id_servico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos_servicos`
--

LOCK TABLES `agendamentos_servicos` WRITE;
/*!40000 ALTER TABLE `agendamentos_servicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `agendamentos_servicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(150) NOT NULL,
  `celular` char(13) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `celular_UNIQUE` (`celular`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Kaique Souza','test@gmail.com','$2y$10$x7CqHAAIl1u5BbM1rl2RHufAZF1IqKrvuihcqbjfXeOOMIM7MWVse','1111111111','2026-06-22 22:53:58','2026-06-22 22:53:58',NULL);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_empresas`
--

DROP TABLE IF EXISTS `clientes_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_empresas` (
  `id_cliente_empresa` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_empresa` int NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cliente_empresa`),
  KEY `fk_clientes_empresas_empresas_idx` (`id_empresa`),
  KEY `fk_clientes_empresas_clientes_idx` (`id_cliente`),
  CONSTRAINT `fk_clientes_empresas_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `fk_clientes_empresas_empresas` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_empresas`
--

LOCK TABLES `clientes_empresas` WRITE;
/*!40000 ALTER TABLE `clientes_empresas` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes_empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colaboradores`
--

DROP TABLE IF EXISTS `colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores` (
  `id_colaborador` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `login` varchar(100) NOT NULL,
  `senha` varchar(200) NOT NULL,
  `is_sa` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_colaborador`),
  UNIQUE KEY `login_UNIQUE` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores`
--

LOCK TABLES `colaboradores` WRITE;
/*!40000 ALTER TABLE `colaboradores` DISABLE KEYS */;
INSERT INTO `colaboradores` VALUES (1,'Kaique Rodrigues','kaique.souza','$2y$10$eAUrpXWdJGh6/k1tWJmJROLcK2yRy3D3/9DmjkNSjlaMGhVV.DbIi',0,'2026-07-01 22:21:45','2026-07-01 22:21:45',NULL);
/*!40000 ALTER TABLE `colaboradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colaboradores_empresas`
--

DROP TABLE IF EXISTS `colaboradores_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores_empresas` (
  `id_colaborador_empresa` int NOT NULL AUTO_INCREMENT,
  `id_colaborador` int NOT NULL,
  `id_empresa` int NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_colaborador_empresa`),
  KEY `fk_colaboradores_empresas_colaborador` (`id_colaborador`),
  KEY `fk_colaboradores_empresas_empresa` (`id_empresa`),
  CONSTRAINT `fk_colaboradores_empresas_colaborador` FOREIGN KEY (`id_colaborador`) REFERENCES `colaboradores` (`id_colaborador`) ON DELETE CASCADE,
  CONSTRAINT `fk_colaboradores_empresas_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores_empresas`
--

LOCK TABLES `colaboradores_empresas` WRITE;
/*!40000 ALTER TABLE `colaboradores_empresas` DISABLE KEYS */;
INSERT INTO `colaboradores_empresas` VALUES (1,1,1,NULL,'2026-07-01 22:21:45');
/*!40000 ALTER TABLE `colaboradores_empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colaboradores_grupos`
--

DROP TABLE IF EXISTS `colaboradores_grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores_grupos` (
  `id_colaborador_grupo` int NOT NULL AUTO_INCREMENT,
  `id_colaborador` int NOT NULL,
  `id_grupo` int NOT NULL,
  `id_empresa` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_colaborador_grupo`),
  KEY `id_colaborador` (`id_colaborador`),
  KEY `id_grupo` (`id_grupo`),
  KEY `fk_colaboradores_grupos_empresas_idx` (`id_empresa`),
  CONSTRAINT `colaboradores_grupos_ibfk_1` FOREIGN KEY (`id_colaborador`) REFERENCES `colaboradores` (`id_colaborador`) ON DELETE CASCADE,
  CONSTRAINT `colaboradores_grupos_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `fk_colaboradores_grupos_empresas` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores_grupos`
--

LOCK TABLES `colaboradores_grupos` WRITE;
/*!40000 ALTER TABLE `colaboradores_grupos` DISABLE KEYS */;
/*!40000 ALTER TABLE `colaboradores_grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresas`
--

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas` (
  `id_empresa` int NOT NULL AUTO_INCREMENT,
  `codigo_empresa` char(4) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas`
--

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;
INSERT INTO `empresas` VALUES (1,'1','Teste empresa','2026-06-21 21:07:38','2026-06-21 22:37:45',NULL);
/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filiais`
--

DROP TABLE IF EXISTS `filiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filiais` (
  `id_filial` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `endereco` varchar(100) NOT NULL,
  `bairro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `uf` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_filial`),
  KEY `fk_filiais_empresas_idx` (`id_empresa`),
  CONSTRAINT `fk_filiais_empresas` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filiais`
--

LOCK TABLES `filiais` WRITE;
/*!40000 ALTER TABLE `filiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `filiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filiais_colaboradores`
--

DROP TABLE IF EXISTS `filiais_colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filiais_colaboradores` (
  `id_filial_colaborador` int NOT NULL AUTO_INCREMENT,
  `id_filial` int NOT NULL,
  `id_colaborador` int NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_filial_colaborador`),
  KEY `fk_filiais_colaboradores_colaboradores_idx` (`id_colaborador`),
  KEY `fk_filiais_colaboradores_filiais_idx` (`id_filial`),
  CONSTRAINT `fk_filiais_colaboradores_colaboradores` FOREIGN KEY (`id_colaborador`) REFERENCES `colaboradores` (`id_colaborador`),
  CONSTRAINT `fk_filiais_colaboradores_filiais` FOREIGN KEY (`id_filial`) REFERENCES `filiais` (`id_filial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filiais_colaboradores`
--

LOCK TABLES `filiais_colaboradores` WRITE;
/*!40000 ALTER TABLE `filiais_colaboradores` DISABLE KEYS */;
/*!40000 ALTER TABLE `filiais_colaboradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_grupo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,'Teste','2026-06-14 19:13:59','2026-06-14 19:13:59',NULL);
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos_permissoes`
--

DROP TABLE IF EXISTS `grupos_permissoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos_permissoes` (
  `id_grupo_permissao` int NOT NULL AUTO_INCREMENT,
  `id_grupo` int NOT NULL,
  `id_permissao` int NOT NULL,
  `created_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_grupo_permissao`),
  KEY `fk_grupos_permissoes_grupos_idx` (`id_grupo`),
  KEY `fk_grupos_permissoes_permissoes_idx` (`id_permissao`),
  CONSTRAINT `fk_grupos_permissoes_grupos` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`),
  CONSTRAINT `fk_grupos_permissoes_permissoes` FOREIGN KEY (`id_permissao`) REFERENCES `permissoes` (`id_permissao`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos_permissoes`
--

LOCK TABLES `grupos_permissoes` WRITE;
/*!40000 ALTER TABLE `grupos_permissoes` DISABLE KEYS */;
INSERT INTO `grupos_permissoes` VALUES (1,1,1,'0000-00-00 00:00:00',NULL);
/*!40000 ALTER TABLE `grupos_permissoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametros_empresas`
--

DROP TABLE IF EXISTS `parametros_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametros_empresas` (
  `id_parametro_empresa` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `tempo_agendamento` int DEFAULT NULL,
  `tempo_intervalo` int DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_parametro_empresa`),
  KEY `fk_parametros_empresas_empresas_idx` (`id_empresa`),
  CONSTRAINT `fk_parametros_empresas_empresas` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametros_empresas`
--

LOCK TABLES `parametros_empresas` WRITE;
/*!40000 ALTER TABLE `parametros_empresas` DISABLE KEYS */;
/*!40000 ALTER TABLE `parametros_empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametros_filiais_colaboradores`
--

DROP TABLE IF EXISTS `parametros_filiais_colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametros_filiais_colaboradores` (
  `id_parametro_filial_colaborador` int NOT NULL AUTO_INCREMENT,
  `id_filial_colaborador` int NOT NULL,
  `tempo_agendamento` int DEFAULT NULL,
  `tempo_intervalo` int DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_parametro_filial_colaborador`),
  KEY `fk_parametros_filiais_colaboradores_filiais_colaboradores_idx` (`id_filial_colaborador`),
  CONSTRAINT `fk_parametros_filiais_colaboradores_filiais_colaboradores` FOREIGN KEY (`id_filial_colaborador`) REFERENCES `filiais_colaboradores` (`id_filial_colaborador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametros_filiais_colaboradores`
--

LOCK TABLES `parametros_filiais_colaboradores` WRITE;
/*!40000 ALTER TABLE `parametros_filiais_colaboradores` DISABLE KEYS */;
/*!40000 ALTER TABLE `parametros_filiais_colaboradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametros_filial`
--

DROP TABLE IF EXISTS `parametros_filial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametros_filial` (
  `id_parametro_filial` int NOT NULL AUTO_INCREMENT,
  `id_filial` int NOT NULL,
  `tempo_agendamento` int DEFAULT NULL,
  `tempo_intervalo` int DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_parametro_filial`),
  KEY `fk_parametros_filiais_filiais_idx` (`id_filial`),
  CONSTRAINT `fk_parametros_filiais_filiais` FOREIGN KEY (`id_filial`) REFERENCES `filiais` (`id_filial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametros_filial`
--

LOCK TABLES `parametros_filial` WRITE;
/*!40000 ALTER TABLE `parametros_filial` DISABLE KEYS */;
/*!40000 ALTER TABLE `parametros_filial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissoes`
--

DROP TABLE IF EXISTS `permissoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissoes` (
  `id_permissao` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_permissao`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissoes`
--

LOCK TABLES `permissoes` WRITE;
/*!40000 ALTER TABLE `permissoes` DISABLE KEYS */;
INSERT INTO `permissoes` VALUES (1,'empresas.editar',NULL,'0000-00-00 00:00:00',NULL);
/*!40000 ALTER TABLE `permissoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicos`
--

DROP TABLE IF EXISTS `servicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicos` (
  `id_servico` int NOT NULL AUTO_INCREMENT,
  `id_filial` int NOT NULL,
  `peso` double NOT NULL,
  `nome` varchar(150) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_servico`),
  KEY `fk_servicos_filial_idx` (`id_filial`),
  CONSTRAINT `fk_servicos_filial` FOREIGN KEY (`id_filial`) REFERENCES `filiais` (`id_filial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicos`
--

LOCK TABLES `servicos` WRITE;
/*!40000 ALTER TABLE `servicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-01 19:22:56
