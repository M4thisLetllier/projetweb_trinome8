<?php

namespace modele;
use PDO;

class station
{
    /**
     * Récupère les statistiques des stations pour un département donné
     * @param PDO $db La connexion à la base de données
     * @param int|string $dep Le numéro du département
     * @return array|false Le tableau des statistiques ou false si erreur/vide
     */
    static function stationbydep($db, $dep)
    {
        $statistiques = [];
        try {
            //Comptage, Moyenne, Bacs de puissance
            $sqlGlobal = "
                SELECT 
                    COUNT(DISTINCT s.id_station_itinerance) AS nombre_stations,
                    ROUND(AVG(p.puissance_nominale), 2) AS puissance_moyenne_kw,
                    SUM(CASE WHEN p.puissance_nominale > 50 THEN 1 ELSE 0 END) AS nb_rapide_plus_50kw,
                    SUM(CASE WHEN p.puissance_nominale > 7.4 AND p.puissance_nominale <= 50 THEN 1 ELSE 0 END) AS nb_accelere,
                    SUM(CASE WHEN p.puissance_nominale <= 7.4 THEN 1 ELSE 0 END) AS nb_normal
                FROM station s
                JOIN commune c ON s.code_commune_insee = c.code_commune_insee
                JOIN pdc p ON s.id_station_itinerance = p.id_station_itinerance
                WHERE c.num_dep = :dep;
            ";

            $stmtGlobal = $db->prepare($sqlGlobal);
            $stmtGlobal->execute([':dep' => $dep]);
            $resultGlobal = $stmtGlobal->fetch(PDO::FETCH_ASSOC);

            // Si le département n'a aucune station, on s'arrête là pour éviter des erreurs
            if (!$resultGlobal || $resultGlobal['nombre_stations'] == 0) {
                return ["message" => "Aucune station trouvée pour ce département."];
            }

            // On ajoute les résultats globaux à notre tableau final
            $statistiques = $resultGlobal;


            //L'implantation majoritaire
            $sqlImplantation = "
                SELECT i.denomination_implantation, COUNT(s.id_station_itinerance) as total
                FROM station s
                JOIN commune c ON s.code_commune_insee = c.code_commune_insee
                JOIN implantation i ON s.id_implantation = i.id_implantation
                WHERE c.num_dep = :dep
                GROUP BY i.id_implantation
                ORDER BY total DESC
                LIMIT 1;
            ";

            $stmtImpl = $db->prepare($sqlImplantation);
            $stmtImpl->execute([':dep' => $dep]);
            $resultImpl = $stmtImpl->fetch(PDO::FETCH_ASSOC);

            $statistiques['implantation_majoritaire'] = $resultImpl ? $resultImpl['denomination_implantation'] : 'Inconnue';

            //La prise la plus utilisée
            $sqlPrise = "
                SELECT tp.denomination_prise, COUNT(a.id_prise) as total
                FROM station s
                JOIN commune c ON s.code_commune_insee = c.code_commune_insee
                JOIN pdc p ON s.id_station_itinerance = p.id_station_itinerance
                JOIN Avoir a ON p.id_pdc_itinerance = a.id_pdc_itinerance
                JOIN type_prise tp ON a.id_prise = tp.id_prise
                WHERE c.num_dep = :dep
                GROUP BY tp.id_prise
                ORDER BY total DESC
                LIMIT 1;
            ";

            $stmtPrise = $db->prepare($sqlPrise);
            $stmtPrise->execute([':dep' => $dep]);
            $resultPrise = $stmtPrise->fetch(PDO::FETCH_ASSOC);

            $statistiques['prise_la_plus_utilisee'] = $resultPrise ? $resultPrise['denomination_prise'] : 'Inconnue';

            // On retourne le tableau complet prêt à être affiché
            return $statistiques;

        } catch (PDOException $e) {
            // En cas d'erreur SQL, on peut lever une exception ou renvoyer false
            // echo $e->getMessage(); // (Utile pour le debug)
            return false;
        }
    }
}