<?php
// api_ia.php- pour environnement Linux
// Ce fichier sert d'API pour interagir avec les scripts Python d'IA (implantation.py et puissance.py)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); /* Permet les requêtes cross-origin pour les tests */

// On accepte POST (pour le site) ET GET (pour tes tests)
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {

    // On récupère les données soit via POST soit via GET
    $id_pdc = htmlspecialchars(($_SERVER['REQUEST_METHOD'] === 'POST' ? $_POST['id_pdc_itinerance'] : $_GET['id_pdc_itinerance']) ?? '');
    $puissance = floatval(($_SERVER['REQUEST_METHOD'] === 'POST' ? $_POST['puissance_nominale'] : $_GET['puissance_nominale']) ?? 0);
    $action_ia = htmlspecialchars(($_SERVER['REQUEST_METHOD'] === 'POST' ? $_POST['action_ia'] : $_GET['action_ia']) ?? '');

    // 1. Détection automatique du répertoire racine
    $base_dir = dirname(__FILE__); 
    
    // 2. Définition de l'exécutable Python (Utilise 'python3' sur Linux)
    $python_exe = "python3"; 
    
    // 3. Choix du script
    if ($action_ia === "btn-predire-implantation") {
        $script_file = "implantation.py";
    } elseif ($action_ia === "btn-predire-puissance") {
        $script_file = "puissance.py";
    } else {
        echo json_encode(["erreur" => "Action non reconnue."]);
        exit;
    }

    $script_path = $base_dir . DIRECTORY_SEPARATOR . "ia" . DIRECTORY_SEPARATOR . $script_file;

    // 5. Vérification de l'existence du fichier
    if (!file_exists($script_path)) {
        echo json_encode([
            "erreur" => "Script introuvable au chemin : " . $script_path
        ]);
        exit;
    }
    
    // 6. Exécution (Linux)
    $commande = "$python_exe " . escapeshellarg($script_path) . " " . escapeshellarg($id_pdc) . " " . escapeshellarg($puissance) . " 2>&1";
    
    $resultat = shell_exec($commande); // Exécute la commande et capture la sortie

    if (!empty($resultat)) { // Vérifie si le résultat n'est pas vide
        echo trim($resultat); // Renvoie le résultat brut du script Python
    } else {
        echo json_encode(["erreur" => "Le modèle IA n'a rien renvoyé."]);
    }

} else {
    echo json_encode(["erreur" => "Méthode non autorisée."]);
}
?>