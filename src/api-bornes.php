<?php
// Définition du header JSON avant tout envoi de texte
header('Content-Type: application/json');

// Connexion au réseau privé Docker (Host: db / Base: ma_base_de_dev)
try {
    $bdd = new PDO('mysql:host=db;dbname=ma_base_de_dev;charset=utf8', 'root', 'motdepassesupersecret');
} catch (Exception $e) {
    echo json_encode(["erreur" => "Connexion échouée : " . $e->getMessage()]);
    exit;
}

// Requête SQL compatible avec MySQL 8.0 (sql_mode=only_full_group_by)
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
          GROUP BY p.id_pdc_itinerance";

$statement = $bdd->prepare($query);
$statement->execute();
$donnees = $statement->fetchAll(PDO::FETCH_ASSOC);

// Envoi du JSON propre au JavaScript
echo json_encode($donnees);