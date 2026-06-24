<?php

require_once "modele/clusters.php";

function GestionDemande($db, $method, $id, $data)
{
    $result = false;

    switch ($method) {
        case 'GET':
            // 1. On récupère tous les points existants pour la carte
            $result = \modele\clusters::getAll($db);
            break;

        case 'POST':
            // 2. On traite la demande de prédiction du formulaire
            $lat = $data['latitude'] ?? null;
            $lon = $data['longitude'] ?? null;

            if ($lat !== null && $lon !== null) {
                $cluster = \modele\clusters::predict($lat, $lon);

                if ($cluster !== false) {
                    // Format attendu par ton fichier Page4Map.js
                    $result = [
                        "success" => true,
                        "cluster" => $cluster
                    ];
                } else {
                    header('HTTP/1.1 500 Internal Server Error');
                    echo json_encode(["success" => false, "erreur" => "Erreur lors de l'exécution de l'IA."]);
                    exit;
                }
            } else {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(["success" => false, "erreur" => "Coordonnées lat/lon manquantes."]);
                exit;
            }
            break;

        default:
            header('HTTP/1.1 405 Method Not Allowed');
            echo json_encode(["error" => "Méthode non autorisée"]);
            exit;
    }

    // Envoi de la réponse JSON (reprise exacte de ta logique de visualisation)
    if ($result !== false) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-control: no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('HTTP/1.1 200 OK');
        echo json_encode($result);
    } else {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(["error" => "Requête invalide"]);
    }
}
