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

    /**
     * Verifica se o usuário (via dados decodificados do JWT) possui uma permissão específica.
     * Mantido como alias para compatibilidade, pois a lógica real de RBAC deve passar por usuarioTemPermissao().
     *
     * $usuarioDados: array decodificado do JWT (resultado de validarToken)
     * $permissaoRequerida: string com o nome da permissão desejada (ex: 'create_user')
     */
    public static function usuarioPossuiPermissao($usuarioDados, $permissaoRequerida)
    {
        return self::usuarioTemPermissao($permissaoRequerida, $usuarioDados);
    }

    /**
     * Verifica se o usuário possui QUALQUER uma das permissões requeridas.
     * Útil para condições OR.
     *
     * $usuarioDados: array decodificado do JWT
     * $permissoesRequeridas: array de strings com as permissões (ex: ['create_user', 'edit_user'])
     */
    public static function usuarioPossuiAlgumaPermissao($usuarioDados, $permissoesRequeridas)
    {
        if (!is_array($usuarioDados) || !isset($usuarioDados['permissoes'])) {
            return false;
        }

        if (!is_array($usuarioDados['permissoes']) || !is_array($permissoesRequeridas)) {
            return false;
        }

        return count(array_intersect($usuarioDados['permissoes'], $permissoesRequeridas)) > 0;
    }

    /**
     * Verifica se o usuário possui TODAS as permissões requeridas.
     * $usuarioDados: array decodificado do JWT
     * $permissoesRequeridas: array de strings com as permissões
     */
    public static function usuarioPossuiTodasPermissoes($usuarioDados, $permissoesRequeridas)
    {
        if (!is_array($usuarioDados) || !isset($usuarioDados['permissoes'])) {
            return false;
        }

        if (!is_array($usuarioDados['permissoes']) || !is_array($permissoesRequeridas)) {
            return false;
        }

        // Verifica se todas as permissões requeridas estão nas permissões do usuário
        foreach ($permissoesRequeridas as $permissao) {
            if (!in_array($permissao, $usuarioDados['permissoes'], true)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Função central: verifica se usuário tem permissão (com suporte a Super Admin).
     * 
     * Lógica:
     * - Se usuário tem flag 'is_sa' = true, retorna true (Super Admin pode tudo)
     * - Se array de permissões contém '*', retorna true (wildcard)
     * - Caso contrário, valida se a permissão está no array
     * 
     * $permissaoRequerida: string ou array de strings
     * $usuarioDados: array decodificado do JWT
     * 
     * Retorna: bool
     */
    public static function usuarioTemPermissao($permissaoRequerida, $usuarioDados)
    {
        // Validações básicas
        if (!is_array($usuarioDados)) {
            return false;
        }

        // 1. Super Admin check
        if (isset($usuarioDados['is_sa']) && $usuarioDados['is_sa'] === true) {
            return true;
        }

        // 2. Verifica se não tem permissões no JWT (usuário inválido)
        if (!isset($usuarioDados['permissoes']) || !is_array($usuarioDados['permissoes'])) {
            return false;
        }

        // 3. Wildcard check: se tem '*', pode fazer qualquer coisa (exceto se houver restrição específica)
        if (in_array('*', $usuarioDados['permissoes'], true)) {
            return true;
        }

        // 4. Validação de permissões específicas
        if (is_array($permissaoRequerida)) {
            // Se passar array, verifica se tem QUALQUER uma (OR logic)
            return self::usuarioPossuiAlgumaPermissao($usuarioDados, $permissaoRequerida);
        } else {
            // Se passar string, verifica se tem EXATAMENTE (AND logic)
            return in_array($permissaoRequerida, $usuarioDados['permissoes'], true);
        }
    }

    /**
     * Valida se o usuário pode acessar uma empresa específica.
     * 
     * Lógica:
     * - Se usuário é Super Admin (is_sa=true), pode acessar qualquer empresa
     * - Se id_empresa está no array 'empresas_acesso', pode acessar
     * - Caso contrário, acesso negado
     * 
     * $idEmpresaAlvo: int - ID da empresa que está tentando acessar
     * $usuarioDados: array decodificado do JWT
     * 
     * Retorna: bool
     */
    public static function usuarioTemAcessoEmpresa($idEmpresaAlvo, $usuarioDados)
    {
        // Validações básicas
        if (!is_array($usuarioDados) || !is_numeric($idEmpresaAlvo)) {
            return false;
        }

        // 1. Super Admin pode acessar qualquer empresa
        if (isset($usuarioDados['is_sa']) && $usuarioDados['is_sa'] === true) {
            return true;
        }

        // 2. Verifica se empresa está no array de empresas_acesso
        if (!isset($usuarioDados['empresas_acesso']) || !is_array($usuarioDados['empresas_acesso'])) {
            return false;
        }

        // 3. Converte para int para comparação segura
        $idEmpresaAlvo = (int) $idEmpresaAlvo;

        return in_array($idEmpresaAlvo, $usuarioDados['empresas_acesso'], true);
    }

    /**
     * Valida múltiplas empresas de uma vez.
     * Retorna true se o usuário pode acessar TODAS elas.
     * 
     * $idsEmpresas: array de integers
     * $usuarioDados: array decodificado do JWT
     * 
     * Retorna: bool
     */
    public static function usuarioTemAcessoTodasEmpresas($idsEmpresas, $usuarioDados)
    {
        if (!is_array($idsEmpresas) || empty($idsEmpresas)) {
            return true; // Se não há empresas para validar, passa
        }

        foreach ($idsEmpresas as $idEmpresa) {
            if (!self::usuarioTemAcessoEmpresa($idEmpresa, $usuarioDados)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validação combinada: verifica permissão + escopo de dados.
     * 
     * Cenário: Usuário quer fazer DELETE em um recurso que pertence a uma empresa.
     * 
     * $permissaoRequerida: string (ex: 'delete_clientes')
     * $idEmpresaRecurso: int (ID da empresa do recurso)
     * $usuarioDados: array decodificado do JWT
     * 
     * Retorna: bool
     */
    public static function usuarioPodeAcessarRecurso($permissaoRequerida, $idEmpresaRecurso, $usuarioDados)
    {
        // Valida permissão
        if (!self::usuarioTemPermissao($permissaoRequerida, $usuarioDados)) {
            return false;
        }

        // Valida escopo de dados
        if (!self::usuarioTemAcessoEmpresa($idEmpresaRecurso, $usuarioDados)) {
            return false;
        }

        return true;
    }

    public static function eSuperAdmin($dadosUsuario)
    {
        return isset($dadosUsuario['is_sa']) && $dadosUsuario['is_sa'] === true;
    }
}
