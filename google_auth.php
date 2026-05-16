<?php
require_once 'config.php';

$auth_url = "https://accounts.google.com/o/oauth2/v2/auth";
$token_url = "https://oauth2.googleapis.com/token";

// Se não tem código, redireciona para o Google
if (!isset($_GET['code'])) {
    $params = [
        'client_id' => CLIENT_ID,
        'redirect_uri' => REDIRECT_URI,
        'response_type' => 'code',
        'scope' => 'https://www.googleapis.com/auth/photoslibrary.readonly',
        'access_type' => 'offline',
        'prompt' => 'consent'
    ];
    header("Location: " . $auth_url . "?" . http_build_query($params));
    exit;
}

// Se recebeu o código, troca pelo Token
$code = $_GET['code'];
$post_params = [
    'code' => $code,
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET,
    'redirect_uri' => REDIRECT_URI,
    'grant_type' => 'authorization_code'
];

$ch = curl_init($token_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_params));
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['refresh_token'])) {
    file_put_contents(TOKEN_FILE, json_encode($data));
    echo "<h1>Sucesso!</h1><p>O Painel agora está conectado ao seu Google Fotos. Pode fechar esta aba.</p>";
} else {
    echo "<h1>Erro!</h1><pre>" . print_r($data, true) . "</pre>";
}
?>
