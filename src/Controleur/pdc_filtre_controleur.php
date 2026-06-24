<?php

require_once "modele/pdc_filtre_modele.php";

function GestionDemandeFiltre($db, $method, $data)
{
    if ($method !== 'GET') {
        header('HTTP/1.1 405 Method Not Allowed');
        echo json_encode(["error" => "Méthode non autorisée"]);
        exit;
    }

    // Récupération des limites géographiques envoyées par la carte
    $lat_min = isset($data['lat_min']) ? (float)$data['lat_min'] : 0;
    $lat_max = isset($data['lat_max']) ? (float)$data['lat_max'] : 90;
    $lon_min = isset($data['lon_min']) ? (float)$data['lon_min'] : -180;
    $lon_max = isset($data['lon_max']) ? (float)$data['lon_max'] : 180;

    // 1. On cherche d'abord les bornes dans la zone affichée
    $result = \modele\pdcFiltre::getBornesDansZone($db, $lat_min, $lat_max, $lon_min, $lon_max);
    
    // 2. Sécurité : Si la zone actuelle est vide, on prend 10 bornes par défaut pour ne pas vider le tableau
    if (empty($result)) {
        $result = \modele\pdcFiltre::getBornesParDefaut($db);
    }

    // Envoi de la réponse JSON au client JavaScript
    header('Content-Type: application/json; charset=utf-8');
    header('HTTP/1.1 200 OK');
    echo json_encode($result);
}