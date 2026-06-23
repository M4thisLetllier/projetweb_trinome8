<?php
echo "<h1>Mon serveur PHP fonctionne !</h1>";

// Vérification des drivers PDO installés
echo "<h2>Drivers PDO disponibles :</h2>";
print_r(PDO::getAvailableDrivers());
?>