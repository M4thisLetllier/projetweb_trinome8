# On part de l'image officielle PHP 8.2 avec le serveur Apache intégré
FROM php:8.2-apache

# On lance la commande officielle pour installer l'extension PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# (Optionnel) On active un module Apache très utile pour le routing (URL Rewriting)
RUN a2enmod rewrite




Get dans la page1MAp.js avec le ?id_pdc_itinerance