<?php

if (!defined('BASE_DIR')) {
    http_response_code(403);
    exit('Acesso restrito.');
}

$apiSubpath = $_SERVER['API_SUBPATH'] ?? '';

require_once __DIR__ . '/../class/classes.php';
