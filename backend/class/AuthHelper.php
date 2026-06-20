<?php

class AuthHelper
{
    private static $secret = 'abc123'; // O ideal é usar getenv('JWT_SECRET')

    public static function validarToken($token)
    {
        $partes = explode('.', $token);
        if (count($partes) !== 3) return false;

        list($header, $payload, $signature) = $partes;

        // Verifica a assinatura
        $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        if ($signature !== $validSignature) return false;

        // Decodifica o payload
        $payloadData = json_decode(base64_decode($payload), true);

        // Verifica se expirou
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Valida a assinatura do token, mas ignora a data de expiração.
     * Útil para recuperar o ID do usuário para renovação da sessão.
     */
    public static function validarTokenSemExp($token)
    {
        $partes = explode('.', $token);
        if (count($partes) !== 3) return false;

        list($header, $payload, $signature) = $partes;

        // 1. Verifica a assinatura (Indispensável para segurança!)
        $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        if ($signature !== $validSignature) return false;

        // 2. Decodifica o payload
        $payloadData = json_decode(base64_decode($payload), true);

        // 3. Retorna os dados sem checar o 'exp'
        return $payloadData;
    }

    /**
     * Retorna todos os headers da requisição.
     */
    public static function obterHeaders()
    {
        if (function_exists('getallheaders')) {
            return getallheaders();
        }

        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (str_starts_with($name, 'HTTP_')) {
                $headerName = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$headerName] = $value;
            }
        }
        return $headers;
    }

    /**
     * Retorna o token Bearer ou o token do cookie.
     */
    public static function obterTokenJwt()
    {
        $headers = self::obterHeaders();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if ($authorization) {
            return preg_replace('/^Bearer\\s+/i', '', trim($authorization));
        }

        return $_COOKIE['access_token'] ?? null;
    }
}
