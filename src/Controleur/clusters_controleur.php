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
//            if ($lat !== null && $lon !== null) {
//                // --- TEST DE DÉBOGAGE DIRECT ---
//                $escapedLat = escapeshellarg($lat);
//                $escapedLon = escapeshellarg($lon);
//
//                // On exécute la commande directement depuis le contrôleur
//                $command = "python3 modele_clusters.py -lat {$escapedLat} -lon {$escapedLon} 2>&1";
//                $output = shell_exec($command);
//
//                // On force l'affichage strict du texte renvoyé par le terminal
//                header('HTTP/1.1 500 Internal Server Error');
//                echo json_encode([
//                    "success" => false,
//                    "erreur" => "LE TERMINAL DIT : " . $output
//                ]);
//                exit;

            if ($lat !== null && $lon !== null) {
                // On récupère la sortie de Python (numéro OU texte d'erreur)
                $output = \modele\clusters::predict($lat, $lon);

                // On essaie de le convertir en chiffre
                $clusterNum = intval($output);

                if ($clusterNum > 0) {
                    // Succès : Python a bien renvoyé un chiffre
                    $result = [
                        "success" => true,
                        "cluster" => $clusterNum
                    ];
                } else {
                    // ÉCHEC : Python a planté. On affiche son message d'erreur !
                    header('HTTP/1.1 500 Internal Server Error');
                    echo json_encode([
                        "success" => false,
                        "erreur" => "Crash Python : " . $output
                    ]);
                    exit;}
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
