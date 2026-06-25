<?php
header('Content-Type: application/json');

// 1. Connexion à la base de données (inclus ton fichier de config)
// require_once 'config.php'; 

if (isset($_GET['id'])) {
    $id_pdc = $_GET['id'];

    // 2. Requête SQL pour chercher la VRAIE puissance dans la table pdc
    // $stmt = $db->prepare("SELECT puissance_nominale FROM pdc WHERE id_pdc_itinerance = :id");
    // $stmt->execute(['id' => $id_pdc]);
    // $result = $stmt->fetch();
    // $vraie_puissance = $result['puissance_nominale'];
    
    // Valeur simulée pour l'exemple, à remplacer par ta vraie requête SQL
    $vraie_puissance = 150; 

    // 3. Exécution du script Python d'IA (Régression / Random Forest)
    // $commande = escapeshellcmd("python3 chemin/vers/ton_script_puissance.py " . $id_pdc);
    // $puissance_predite = shell_exec($commande);
    
    // Valeur simulée pour l'exemple
    $puissance_predite = 138.5; 
    $score_ia = 91.0; 

    // 4. On renvoie tout au JavaScript au format JSON propre
    echo json_encode([
        'success' => true,
        'vraie_puissance' => $vraie_puissance,
        'puissance_predite' => $puissance_predite,
        'score_ia' => $score_ia
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
}
?>