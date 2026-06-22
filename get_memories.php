<?php
header('Content-Type: application/json');
require_once 'config.php';

$CACHE_FILE = 'memories_cache.json';
$CACHE_DURATION = 1800; // 30 minutos (as URLs base do Google expiram após 60 min)

// Verifica se existe cache válido
if (file_exists($CACHE_FILE) && (time() - filemtime($CACHE_FILE) < $CACHE_DURATION)) {
    $cache_data = json_decode(file_get_contents($CACHE_FILE), true);
    if (!empty($cache_data)) {
        echo json_encode($cache_data);
        exit;
    }
}

$foundMedia = [];

// PLANO A: Tenta obter fotos do Álbum Compartilhado via Scraping da URL Pública
if (defined('GOOGLE_PHOTOS_ALBUM_URL') && !empty(GOOGLE_PHOTOS_ALBUM_URL)) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, GOOGLE_PHOTOS_ALBUM_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    $html = curl_exec($ch);
    curl_close($ch);

    if ($html) {
        preg_match_all('/https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9-_]+/i', $html, $matches);
        if (!empty($matches[0])) {
            $unique_bases = [];
            foreach ($matches[0] as $u) {
                $parts = explode('=', $u);
                $base = $parts[0];
                if (strlen($base) > 50) {
                    $unique_bases[$base] = true;
                }
            }
            foreach (array_keys($unique_bases) as $base_url) {
                $foundMedia[] = [
                    'url' => $base_url,
                    'caption' => 'Lembrança do Álbum'
                ];
            }
        }
    }
}

// Se encontrou fotos no álbum público, salva no cache e retorna
if (!empty($foundMedia)) {
    file_put_contents($CACHE_FILE, json_encode($foundMedia));
    echo json_encode($foundMedia);
    exit;
}

if (!file_exists(TOKEN_FILE)) {
    echo json_encode(['error' => 'Não autenticado. Acesse google_auth.php primeiro.']);
    exit;
}

$tokens = json_decode(file_get_contents(TOKEN_FILE), true);
$refresh_token = $tokens['refresh_token'];

// 1. Atualizar o Access Token
$ch = curl_init("https://oauth2.googleapis.com/token");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET,
    'refresh_token' => $refresh_token,
    'grant_type' => 'refresh_token'
]));
$res = curl_exec($ch);
$token_data = json_decode($res, true);
$access_token = isset($token_data['access_token']) ? $token_data['access_token'] : null;

if (!$access_token) {
    // Se falhar, tenta retornar o cache velho (mesmo expirado) para não quebrar a tela
    if (file_exists($CACHE_FILE)) {
        echo file_get_contents($CACHE_FILE);
    } else {
        echo json_encode([['url' => '', 'caption' => 'Erro: Falha ao renovar token do Google. Reautorize em google_auth.php.']]);
    }
    exit;
}

// 2. Buscar fotos de anos anteriores (Hoje, mas em anos passados)
$day = (int)date('d');
$month = (int)date('m');
$currentYear = (int)date('Y');
$foundMedia = [];

// Tenta buscar fotos de hoje nos últimos 12 anos
for ($yearOffset = 1; $yearOffset <= 12; $yearOffset++) {
    $searchYear = $currentYear - $yearOffset;
    $searchParams = ['filters' => ['dateFilter' => ['dates' => [['year' => $searchYear, 'month' => $month, 'day' => $day]]]]];

    $ch = curl_init("https://photoslibrary.googleapis.com/v1/mediaItems:search");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token", "Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($searchParams));
    $searchRes = curl_exec($ch);
    $searchData = json_decode($searchRes, true);

    if (isset($searchData['mediaItems'])) {
        foreach ($searchData['mediaItems'] as $item) {
            $foundMedia[] = [
                'url' => $item['baseUrl'],
                'caption' => "Há $yearOffset anos neste dia..."
            ];
        }
    }
    if (count($foundMedia) > 5) break;
}

// PLANO C: Se a biblioteca principal está vazia, tenta buscar dentro de Álbuns
if (empty($foundMedia)) {
    $ch = curl_init("https://photoslibrary.googleapis.com/v1/albums?pageSize=5");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token"]);
    $albumRes = curl_exec($ch);
    $albumData = json_decode($albumRes, true);

    if (isset($albumData['albums'])) {
        foreach ($albumData['albums'] as $album) {
            $albumId = $album['id'];
            $ch = curl_init("https://photoslibrary.googleapis.com/v1/mediaItems:search");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token", "Content-Type: application/json"]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['albumId' => $albumId, 'pageSize' => 10]));
            $itemRes = curl_exec($ch);
            $itemData = json_decode($itemRes, true);
            
            if (isset($itemData['mediaItems'])) {
                foreach ($itemData['mediaItems'] as $item) {
                    $foundMedia[] = [
                        'url' => $item['baseUrl'],
                        'caption' => "Lembrança do álbum: " . $album['title']
                    ];
                }
            }
            if (count($foundMedia) > 20) break;
        }
    }
}

// PLANO D: Se ainda nada, tenta buscar em Álbuns Compartilhados (Shared Albums)
if (empty($foundMedia)) {
    $ch = curl_init("https://photoslibrary.googleapis.com/v1/sharedAlbums?pageSize=5");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token"]);
    $sharedRes = curl_exec($ch);
    $sharedData = json_decode($sharedRes, true);

    if (isset($sharedData['sharedAlbums'])) {
        foreach ($sharedData['sharedAlbums'] as $album) {
            $ch = curl_init("https://photoslibrary.googleapis.com/v1/mediaItems:search");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token", "Content-Type: application/json"]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['albumId' => $album['id'], 'pageSize' => 10]));
            $itemRes = curl_exec($ch);
            $itemData = json_decode($itemRes, true);
            
            if (isset($itemData['mediaItems'])) {
                foreach ($itemData['mediaItems'] as $item) {
                    $foundMedia[] = ['url' => $item['baseUrl'], 'caption' => "Lembrança do álbum: " . $album['title']];
                }
            }
            if (count($foundMedia) > 20) break;
        }
    }
}

// Se AINDA estiver vazio, manda um erro informativo
if (empty($foundMedia)) {
    $result = [['url' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1200', 'caption' => 'Conectado! Adicione fotos à biblioteca do Google Photos para exibi-las aqui.']];
} else {
    $result = $foundMedia;
}

// Salva no cache antes de devolver
file_put_contents($CACHE_FILE, json_encode($result));

echo json_encode($result);
?>
