ALTER TABLE servicos_filiais
    ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN valor DECIMAL(10, 2) NULL DEFAULT NULL,
    ADD COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN duracao INT NULL DEFAULT NULL,
    ADD COLUMN buffer_antes INT NOT NULL DEFAULT 0,
    ADD COLUMN buffer_depois INT NOT NULL DEFAULT 0;

ALTER TABLE grupos
    ADD COLUMN prestador TINYINT(1) NOT NULL DEFAULT 0;

CREATE INDEX idx_servicos_filiais_ativos
    ON servicos_filiais (id_servico, id_filial, deleted_at);