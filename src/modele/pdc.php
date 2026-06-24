<?php

namespace modele;

use PDO;

class pdc
{
    /**
     * @param PDO $db
     * @return mixed All pdc
     */
    static function getpdc($db){
        $query = "SELECT 
            p.id_pdc_itinerance,
            MAX(a.nom_amenageur) AS nom_amenageur,
            MAX(d.denomination_dep) AS denomination_dep,
            MAX(p.puissance_nominale) AS puissance_nominale,
            GROUP_CONCAT(DISTINCT tp.denomination_prise SEPARATOR ', ') AS denomination_prise,
            MAX(c.nom_commune) AS nom_commune,
            GROUP_CONCAT(DISTINCT tpay.denomination_paiment SEPARATOR ', ') AS denomination_paiment,
            MAX(p.latitude_pdc) AS latitude_pdc,
            MAX(p.longitude_pdc) AS longitude_pdc
          FROM pdc p
          JOIN station s ON p.id_station_itinerance = s.id_station_itinerance
          JOIN amenageur a ON s.id_amenageur = a.id_amenageur
          JOIN commune c ON s.code_commune_insee = c.code_commune_insee
          JOIN departement d ON c.num_dep = d.num_dep
          LEFT JOIN Avoir av ON p.id_pdc_itinerance = av.id_pdc_itinerance
          LEFT JOIN type_prise tp ON av.id_prise = tp.id_prise
          LEFT JOIN PAYER pay ON p.id_pdc_itinerance = pay.id_pdc_itinerance
          LEFT JOIN type_paiment tpay ON pay.id_paiment = tpay.id_paiment
          GROUP BY p.id_pdc_itinerance
          Limit 10";

        $statement = $db->prepare($query);
        $statement->execute();
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
    /** Renvoie les dix premiers point de charge
     * @param PDO $db base de données
     * @return mixed 10 données
     */
    static function pdchead($db)
    {
        $stmt =$db -> prepare("
        SELECT puissance_nominale, tarif, longitude_pdc, latitude_pdc
        FROM pdc
        LIMIT 10;");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $results;
    }

    /**
     * Trouve les données d'un pdc précis
     * @param PDO $db la base de données
     * @param integer $id l'indice de la base
     * @return mixed les données de le base
     *
     */

    static function pdcwithid($db,$id)
    {
        $stmt =$db -> prepare("
        SELECT puissance_nominale, tarif, longitude_pdc, latitude_pdc
        FROM pdc
        WHERE id_pdc_itinerance = :id;");
        $stmt->bindParam(":id",$id);
        $stmt->execute();
        $results = $stmt->fetch();
        return $results;
    }
    /**
     * Supprime le point de charge d'indice $id
     * @param PDO $db la base de donnée
     * @param integer $id L'indice à supprimer
     *
     */
    static function deletepdc($db,$id)
    {
        $stmt =$db -> prepare("
        DELETE FROM pdc WHERE id_pdc_itinerance = :id;");
        $stmt->bindParam(":id",$id);
        $stmt->execute();
        $results = $stmt->fetch();
        return $results;
    }
    /**
     * Met à jour une valeur spécifique pour un PDC donné.
     * @param PDO $db la base de donnée
     * @param string $idPdc L'identifiant (id_pdc_itinerance)
     * @param string $columnName Le nom de la colonne à modifier
     * @param mixed $newValue La nouvelle valeur à insérer
     * @return bool réussite de la requète
     */
    static function updateValue($db,$idPdc, $columnName, $newValue)
    {
        $allowedColumns = [
            'puissance_nominale',
            'tarif',
            'latitude_pdc',
            'longitude_pdc',
            'date_maj',
            'id_station_itinerance',
            'id_accessibilite',
            'id_restriction_gabarit',
            'id_acces'
        ];
        if (!in_array($columnName, $allowedColumns)) {
            throw new Exception("Erreur de sécurité : Tentative de modification d'une colonne non autorisée ($columnName).");
        }

        $stmt = $db->prepare("
        UPDATE pdc 
        SET {$columnName} = :nouvelleValeur 
        WHERE id_pdc_itinerance = :idPdc;");
        $stmt->bindParam(":nouvelleValeur", $newValue);
        $stmt->bindParam(":idPdc", $idPdc);

        return $stmt->execute();
    }
    /**
     * Ajoute un nouveau Point de Charge (PDC) dans la base de données.
     * @param PDO $db la base de donnée
     * @param array $data Tableau de toutes les données
     * @return bool reussite de la fonction
     */
    public function addPdc($db,array $data) {

        $stmt = $db->prepare("
        INSERT INTO pdc (
            id_pdc_itinerance,
            puissance_nominale,
            tarif,
            latitude_pdc,
            longitude_pdc,
            date_maj,
            id_station_itinerance,
            id_accessibilite,
            id_restriction_gabarit,
            id_acces
        ) VALUES (
                    :id_pdc_itinerance, 
                    :puissance_nominale, 
                    :tarif, 
                    :latitude_pdc, 
                    :longitude_pdc, 
                    :date_maj, 
                    :id_station_itinerance, 
                    :id_accessibilite, 
                    :id_restriction_gabarit, 
                    :id_acces
                );");
        return $stmt->execute([
            ':id_pdc_itinerance'      => $data['id_pdc_itinerance'],
            ':puissance_nominale'     => $data['puissance_nominale'] ?? null,
            ':tarif'                  => $data['tarif'] ?? null,
            ':latitude_pdc'           => $data['latitude_pdc'],
            ':longitude_pdc'          => $data['longitude_pdc'],
            ':date_maj'               => $data['date_maj'] ?? date('Y-m-d'), // Met la date du jour par défaut
            ':id_station_itinerance'  => $data['id_station_itinerance'],
            ':id_accessibilite'       => $data['id_accessibilite'],
            ':id_restriction_gabarit' => $data['id_restriction_gabarit'],
            ':id_acces'               => $data['id_acces']
        ]);
    }
}