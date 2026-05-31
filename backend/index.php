<?php

// Define o cabeçalho para retorno em JSON
header('Content-Type: application/json; charset=utf-8');

// Inclui a classe Empresas (a classe Conexao já é chamada dentro dela)
require_once __DIR__ . '/class/classes.php';

try {
    // Instancia a classe
    $Empresa = new Empresas();

    // Chama o método listar, que retorna o array de dados
    $resultado = $Empresa->listar();
} catch (Throwable $e) {
    http_response_code(500);
    $resultado = [
        'status' => 'erro',
        'mensagem' => 'Erro no backend: ' . $e->getMessage()
    ];
}

// Converte o array retornado para o formato JSON e imprime na tela
echo json_encode($resultado);
