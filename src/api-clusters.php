<?php
// 1. Autoriser le JavaScript à lire le JSON et définir le format d'envoi
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 2. Connexion à la base de données Docker
try {
    $bdd = new PDO('mysql:host=db;dbname=ma_base_de_dev;charset=utf8', 'root', 'motdepassesupersecret');
    $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(["erreur" => "Connexion BDD échouée : " . $e->getMessage()]);
    exit;
}

// 3. Requête SQL pour récupérer les bornes avec leurs coordonnées
// (On tente de prendre la colonne cluster si elle existe déjà)
try {
    $query = "SELECT p.id_pdc_itinerance, p.latitude_pdc, p.longitude_pdc, p.puissance_nominale 
              FROM pdc p 
              WHERE p.latitude_pdc IS NOT NULL AND p.longitude_pdc IS NOT NULL";
    
    // Si tu as déjà ajouté la colonne cluster, commente la ligne du dessus et décommente celle-ci :
    // $query = "SELECT id_pdc_itinerance, latitude_pdc, longitude_pdc, puissance_nominale, cluster FROM pdc WHERE latitude_pdc IS NOT NULL";

    $statement = $bdd->prepare($query);
    $statement->execute();
    $bornes = $statement->fetchAll(PDO::FETCH_ASSOC);

    // 4. Simulation / Traitement des clusters
    $resultat = [];
    foreach ($bornes as $borne) {
        
        // Si la colonne cluster n'existe pas encore dans ta table SQL,
        // on simule le modèle de classification IA selon la puissance :
        if (!isset($borne['cluster'])) {
            $puissance = (float)$borne['puissance_nominale'];
            if ($puissance > 50) {
                $borne['cluster'] = 1; // Haute puissance (Vert)
            } elseif ($puissance < 11) {
                $borne['cluster'] = 2; // Zone rurale lente (Bleu)
            } else {
                $borne['cluster'] = 3; // Réseau urbain standard (Orange)
            }
        }

        $resultat[] = $borne;
    }

    // 5. Envoi du résultat au JavaScript de la carte
    echo json_encode($resultat);

} catch (Exception $e) {
    echo json_encode(["erreur" => "Erreur lors de la requête : " . $e->getMessage()]);
}
?>