<?php

namespace modele;

use PDO;
class departement
{
    static function getAll($db)
    {
        $stmt =$db -> prepare("
        SELECT num_dep, denomination_dep
        FROM departement;");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $results;
    }
}