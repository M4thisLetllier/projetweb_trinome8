<?php


namespace modele;

use PDO;

class clusters
{

    public static function getAll($db)
    {
        // Note : Si tu as ajouté une colonne 'cluster' dans ta table 'pdc', n'oublie pas de la rajouter dans le SELECT !
        $stmt = $db->prepare("
            SELECT * 
            FROM cluster;
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Appelle le script Python pour prédire le cluster (POST)
     */
    public static function predict($lat, $lon)
    {
        $escapedLat = escapeshellarg($lat);
        $escapedLon = escapeshellarg($lon);

        // Exécution de la commande système vers ton fichier Python
        $command = "python3 modele_clusters.py -lat {$escapedLat} -lon {$escapedLon} 2>&1";
        $output = shell_exec($command);

        if ($output !== null) {
            return intval(trim($output));
        }
        return false;
    }
}