<?php
// api_ia.php - Version finale pour projet A3
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. Récupération sécurisée des données
    $id_pdc = htmlspecialchars($_POST['id_pdc_itinerance'] ?? '');
    $puissance = floatval($_POST['puissance_nominale'] ?? 0);
    $action_ia = htmlspecialchars($_POST['action_ia'] ?? '');

    // 2. Configuration des chemins relatifs (plus robuste)
    $base_dir = dirname(__FILE__); // Chemin du répertoire src/
    $python_exe = "C:/Users/hp/AppData/Local/Python/pythoncore-3.14-64/python.exe";
    
    // Choix du script
    if ($action_ia === "btn-predire-implantation") {
        $script_file = "implantation.py";
    } elseif ($action_ia === "btn-predire-puissance") {
        $script_file = "puissance.py";
    } else {
        echo json_encode(["erreur" => "Action non reconnue."]);
        exit;
    }

    // Construction du chemin complet avec backslashes pour Windows
    $script_path = $base_dir . DIRECTORY_SEPARATOR . "ia" . DIRECTORY_SEPARATOR . $script_file;

    // 3. Vérification de l'existence du fichier
    if (!file_exists($script_path)) {
        echo json_encode(["erreur" => "Script introuvable au chemin : " . $script_path]);
        exit;
    }

    // 4. Construction et exécution de la commande
    // Les guillemets autour de $script_path gèrent les espaces dans le chemin
    $commande = escapeshellcmd("$python_exe \"$script_path\" \"$id_pdc\" $puissance") . " 2> nul";
    
    $resultat = shell_exec($commande);

    // 5. Envoi de la réponse JSON
    if (!empty($resultat)) {
        echo trim($resultat);
    } else {
        echo json_encode(["erreur" => "Le modèle IA n'a rien répondu."]);
    }

} else {
    echo json_encode(["erreur" => "Méthode non autorisée."]);
}
?>