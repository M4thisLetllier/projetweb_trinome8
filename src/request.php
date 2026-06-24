<?php
require_once('database.php');

// Connexion à la bdd
$db = dbConnect();
if (!$db)
{
    header('HTTP/1.1 503 Service Unavailable');
    exit;
}

// Vérifie la requête
$requestMethod = $_SERVER['REQUEST_METHOD'];
$request = substr($_SERVER['PATH_INFO'], 1);
$request = explode('/', $request);
$requestRessource = array_shift($request);

// Vérifie l'id associé à la requête
$id = array_shift($request);
if ($id == '')
    $id = NULL;

//On récupère les datas en fonctions de la méthode
switch ($requestMethod) {
    case 'GET':
        $data = $_GET;
        break;
    case 'POST':
        $data = $_POST;
        break;
    case 'PUT':
        parse_str(file_get_contents("php://input"),$data);
        break;
    case 'DELETE':
        break;
    default:
        //http_response_code(405);
        echo json_encode(["error" => "Méthode non autorisée"]);
        exit;
}

//si la requête porte sur une installation
switch ($requestRessource) {
    case "pdc":
        require_once "controleur/visualisation_controleur.php";
        //ici l'id représente la stat demandée
        GestionDemande($db,$requestMethod,$id,$data);
        break;

    case "dep":
        require_once "controleur/departement_controleur.php";
        GestionDemande($db,$requestMethod,$id,$data);
        break;
    case "clusters":
        require_once "controleur/clusters_controleur.php";
        GestionDemande($db, $requestMethod, $id, $data);
        break;

    case "pdc-filtre":
        require_once "controleur/pdc_filtre_controleur.php";
        GestionDemandeFiltre($db, $requestMethod, $data);
        break;

    case 'test':
        echo "oui";
        break;
    default:
        echo json_encode(["error" => "Ressource inexistante"]);

}
exit;
?>
