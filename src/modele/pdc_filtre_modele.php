<?php

namespace modele;

use PDO;

class pdcFiltre
{
    /**
     * Récupère un lot plus important de bornes pour la zone (ex: 300) afin de garnir la carte,
     * le JavaScript se chargera de couper à 10 pour le tableau.
     */
    static function getBornesDansZone($db, $lat_min, $lat_max, $lon_min, $lon_max)
    {
        // On monte la limite à 300 pour avoir plein de points sur la carte
        $sql =  "SELECT * FROM pdc 
                WHERE latitude_pdc BETWEEN :lat_min AND :lat_max 
                AND longitude_pdc BETWEEN :lon_min AND :lon_max 
                LIMIT 200";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            'lat_min' => $lat_min,
            'lat_max' => $lat_max,
            'lon_min' => $lon_min,
            'lon_max' => $lon_max
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère des bornes par défaut si la zone est vide
     */
    static function getBornesParDefaut($db)
    {
        $sql = "SELECT * FROM pdc LIMIT 100";
        $stmt = $db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}