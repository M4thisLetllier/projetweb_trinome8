<?php
//on récupère le modèle
require_once "modele/pdc.php";

function GestionDemande($db,$method, $id, $data)
{
    $result=false;
    switch ($method) {
        case 'GET':
            if ($id !=NULL) {
                //on renvoie les result d'une installation précise
                $result = \modele\pdc::pdcwithid($db,$id);
            }
            else{
                $result=\modele\pdc::pdchead($db);
            }
            break;
        case 'POST':
            $result ="teste Post";
            break;
        case 'DELETE':
            $result = "test delete";
            break;
        case 'PUT':
            $result = "test put";
            break;
        default:
            http_response_code(405);
            echo json_encode(["error" => "Méthode non autorisee"]);
    }

    if($result !=false){
        // Envoie des données au client
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-control: no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('HTTP/1.1 200 OK');
        echo json_encode($result);
    }
    else{
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(["error" => "Statistique demandee non valide"]);
    }
}