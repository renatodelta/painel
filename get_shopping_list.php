<?php
header('Content-Type: application/json');
$url = "https://docs.google.com/spreadsheets/d/14hIZHehMWzo9uUuvJq2JkhLx_Zha525dheCpN9QXs34/export?format=csv";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$csv = curl_exec($ch);
curl_close($ch);

$items = [];
if ($csv) {
    $lines = explode("\n", trim($csv));
    foreach ($lines as $line) {
        // Remover aspas caso o CSV venha com campos entre aspas, e limpa espaços
        $item = trim(trim($line, " \t\n\r\0\x0B\""));
        if (!empty($item)) {
            $items[] = $item;
        }
    }
}

echo json_encode($items);
?>
