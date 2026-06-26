<?php
// api_ia.php - Version POST uniquement
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Blocage de tout ce qui n'est pas du POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Récupération directe et sécurisée depuis $_POST 
    $id_pdc = htmlspecialchars($_POST['id_pdc_itinerance'] ?? '');
    $puissance = floatval($_POST['puissance_nominale'] ?? 0);
    $action_ia = htmlspecialchars($_POST['action_ia'] ?? '');

    $base_dir = dirname(__FILE__); 
    $python_exe = "python3"; 
    
    // Routage vers le bon script IA
    if ($action_ia === "btn-predire-implantation") { // Si l'action est pour l'implantation
        $script_file = "implantation.py"; // Script Python pour l'implantation
    } elseif ($action_ia === "btn-predire-puissance") {
        $script_file = "puissance.py";
    } else {
        echo json_encode(["erreur" => "Action non reconnue."]);
        exit;
    }
    # Construction du chemin complet vers le script Python
    $script_path = $base_dir . DIRECTORY_SEPARATOR . "ia" . DIRECTORY_SEPARATOR . $script_file;

    // Vérification et exécution
    if (!file_exists($script_path)) {
        echo json_encode(["erreur" => "Script introuvable."]);
        exit;
    }
    # Construction de la commande shell pour exécuter le script Python avec les paramètres
    $commande = "$python_exe " . escapeshellarg($script_path) . " " . escapeshellarg($id_pdc) . " " . escapeshellarg($puissance) . " 2>&1";
    $resultat = shell_exec($commande);

    // Renvoi des données au JavaScript
    if (!empty($resultat)) {
        echo trim($resultat);
    } else {
        echo json_encode(["erreur" => "Le modèle IA n'a rien renvoyé."]);
    }

} else {
    // Rejet de sécurité si quelqu'un essaie d'y accéder via une URL (GET)
    echo json_encode(["erreur" => "Méthode non autorisée. Veuillez utiliser l'interface web."]);
}
?>