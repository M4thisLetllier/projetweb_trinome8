<?php

namespace modele;

use PDO;

class pdc
{
    static function pdchead($db)
    {
        $stmt =$db -> prepare("
        SELECT puissance_nominale, tarif, longitude_pdc, latitude_pdc
        FROM pdc
        LIMIT 10");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $results;
    }
    static function pdcheadwithid($db,$id)
    {
        $stmt =$db -> prepare("
        SELECT puissance_nominale, tarif, longitude_pdc, latitude_pdc
        FROM pdc
        WHERE id_pdc_itinerance = :id");
        $stmt->bindParam(":id",$id);
        $stmt->execute();
        $results = $stmt->fetch();
        return $results;
    }
}