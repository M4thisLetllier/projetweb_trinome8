-- ----------------------------------------------------------
-- Script MYSQL pour mcd
-- ----------------------------------------------------------
-- On désactive temporairement la sécurité des clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS PAYER;
DROP TABLE IF EXISTS Avoir;
DROP TABLE IF EXISTS pdc;
DROP TABLE IF EXISTS station;
DROP TABLE IF EXISTS commune;
DROP TABLE IF EXISTS departement;
DROP TABLE IF EXISTS implantation;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS operateur;
DROP TABLE IF EXISTS amenageur;
DROP TABLE IF EXISTS Accessibilite_pmr;
DROP TABLE IF EXISTS type_paiment;
DROP TABLE IF EXISTS restriction_gabarit;
DROP TABLE IF EXISTS Enseigne;
DROP TABLE IF EXISTS horaire;
DROP TABLE IF EXISTS condition_acces;
DROP TABLE IF EXISTS type_prise;

-- On réactive la sécurité des clés étrangères
SET FOREIGN_KEY_CHECKS = 1;
-- ----------------------------
-- Table: type_prise
-- ----------------------------
CREATE TABLE type_prise (
                            id_prise INT NOT NULL AUTO_INCREMENT,
                            denomination_prise VARCHAR(128) NOT NULL,
                            CONSTRAINT type_prise_PK PRIMARY KEY (id_prise)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: condition_acces
-- ----------------------------
CREATE TABLE condition_acces (
                                 id_acces SMALLINT NOT NULL AUTO_INCREMENT,
                                 denomination_acces VARCHAR(50) NOT NULL,
                                 CONSTRAINT condition_acces_PK PRIMARY KEY (id_acces),
                                 CONSTRAINT id_acces_UNQ UNIQUE (id_acces)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: horraire
-- ----------------------------
CREATE TABLE horaire (
                          id_horaire INT NOT NULL AUTO_INCREMENT,
                          denomination_horaire VARCHAR(100) NOT NULL,
                          CONSTRAINT horaire_PK PRIMARY KEY (id_horaire)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: Enseigne
-- ----------------------------
CREATE TABLE Enseigne (
                          id_enseigne INT NOT NULL AUTO_INCREMENT,
                          nom_enseigne VARCHAR(100) NOT NULL,
                          CONSTRAINT Enseigne_PK PRIMARY KEY (id_enseigne),
                          CONSTRAINT id_enseigne_UNQ UNIQUE (id_enseigne)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: restriction_gabarit
-- ----------------------------
CREATE TABLE restriction_gabarit (
                                     id_restriction_gabarit INT NOT NULL AUTO_INCREMENT,
                                     denomination VARCHAR(50) NOT NULL,
                                     CONSTRAINT restriction_gabarit_PK PRIMARY KEY (id_restriction_gabarit),
                                     CONSTRAINT id_restriction_gabarit_UNQ UNIQUE (id_restriction_gabarit)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: type_paiment
-- ----------------------------
CREATE TABLE type_paiment (
                              id_paiment INT NOT NULL AUTO_INCREMENT,
                              denomination_paiment VARCHAR(100) NOT NULL,
                              CONSTRAINT type_paiment_PK PRIMARY KEY (id_paiment),
                              CONSTRAINT id_paiment_UNQ UNIQUE (id_paiment)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: Accessibilite_pmr
-- ----------------------------
CREATE TABLE Accessibilite_pmr (
                                   id_accessibilite SMALLINT NOT NULL AUTO_INCREMENT,
                                   denomination_accessibilite VARCHAR(50) NOT NULL,
                                   CONSTRAINT Accessibilite_pmr_PK PRIMARY KEY (id_accessibilite),
                                   CONSTRAINT id_accessibilite_UNQ UNIQUE (id_accessibilite)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: amenageur
-- ----------------------------
CREATE TABLE amenageur (
                           id_amenageur INT NOT NULL AUTO_INCREMENT,
                           nom_amenageur VARCHAR(128) NOT NULL,
                           contact_amenageur VARCHAR(128),
                           CONSTRAINT amenageur_PK PRIMARY KEY (id_amenageur),
                           CONSTRAINT id_amenageur_UNQ UNIQUE (id_amenageur)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: operateur
-- ----------------------------
CREATE TABLE operateur (
                           id_operateur INT NOT NULL AUTO_INCREMENT,
                           nom_operateur VARCHAR(128) NOT NULL,
                           contact_operateur VARCHAR(128),
                           telephone_operateur VARCHAR(128),
                           CONSTRAINT operateur_PK PRIMARY KEY (id_operateur)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: region
-- ----------------------------
CREATE TABLE region (
                        id_region INT NOT NULL AUTO_INCREMENT,
                        denomination_region VARCHAR(50) NOT NULL,
                        CONSTRAINT region_PK PRIMARY KEY (id_region)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: implatation
-- ----------------------------
CREATE TABLE implantation (
                             id_implantation INT NOT NULL AUTO_INCREMENT,
                             denomination_implantation VARCHAR(128) NOT NULL,
                             CONSTRAINT implatation_PK PRIMARY KEY (id_implantation)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: departement
-- ----------------------------
CREATE TABLE departement (
                             num_dep INT NOT NULL,
                             denomination_dep VARCHAR(50) NOT NULL,
                             id_region INT,
                             CONSTRAINT departement_PK PRIMARY KEY (num_dep),
                             CONSTRAINT departement_id_region_FK FOREIGN KEY (id_region) REFERENCES region (id_region)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: commune
-- ----------------------------
CREATE TABLE commune (
                         code_commune_insee INT NOT NULL,
                         code_postal INT NOT NULL,
                         nom_commune VARCHAR(50) NOT NULL,
                         latitude_centroide DECIMAL(10,2) NOT NULL,
                         longitude_centroide DECIMAL(10,2) NOT NULL,
                         num_dep INT,
                         CONSTRAINT commune_PK PRIMARY KEY (code_commune_insee),
                         CONSTRAINT commune_num_dep_FK FOREIGN KEY (num_dep) REFERENCES departement (num_dep)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: station
-- ----------------------------
CREATE TABLE station (
                         id_station_itinerance VARCHAR(128) NOT NULL,
                         nom_station VARCHAR(128) NOT NULL,
                         adresse_station VARCHAR(300),
                         nombre_pdc INT,
                         date_mise_service DATE,
                         id_implantation INT NOT NULL,
                         id_amenageur INT NOT NULL,
                         id_operateur INT NOT NULL,
                         code_commune_insee INT NOT NULL,
                         id_enseigne INT NOT NULL,
                         id_horaire INT,
                         CONSTRAINT station_PK PRIMARY KEY (id_station_itinerance),
                         CONSTRAINT station_id_implantation_FK FOREIGN KEY (id_implantation) REFERENCES implantation (id_implantation),
                         CONSTRAINT station_id_amenageur_FK FOREIGN KEY (id_amenageur) REFERENCES amenageur (id_amenageur),
                         CONSTRAINT station_id_operateur_FK FOREIGN KEY (id_operateur) REFERENCES operateur (id_operateur),
                         CONSTRAINT station_code_commune_insee_FK FOREIGN KEY (code_commune_insee) REFERENCES commune (code_commune_insee),
                         CONSTRAINT station_id_enseigne_FK FOREIGN KEY (id_enseigne) REFERENCES Enseigne (id_enseigne),
                         CONSTRAINT station_id_horaire_FK FOREIGN KEY (id_horaire) REFERENCES horaire (id_horaire)
)ENGINE=InnoDB;

-- ----------------------------
-- Table: pdc
-- ----------------------------
CREATE TABLE pdc (
                     id_pdc_itinerance VARCHAR(128) NOT NULL,
                     puissance_nominale INT,
                     tarif DECIMAL(10,2),
                     latitude_pdc DECIMAL(10,2) NOT NULL,
                     longitude_pdc DECIMAL(10,2) NOT NULL,
                     date_maj DATE,
                     id_station_itinerance VARCHAR(128) NOT NULL,
                     id_accessibilite SMALLINT NOT NULL,
                     id_restriction_gabarit INT NOT NULL,
                     id_acces SMALLINT NOT NULL,
                     CONSTRAINT pdc_PK PRIMARY KEY (id_pdc_itinerance),
                     CONSTRAINT pdc_id_station_itinerance_FK FOREIGN KEY (id_station_itinerance) REFERENCES station (id_station_itinerance),
                     CONSTRAINT pdc_id_accessibilite_FK FOREIGN KEY (id_accessibilite) REFERENCES Accessibilite_pmr (id_accessibilite),
                     CONSTRAINT pdc_id_restriction_gabarit_FK FOREIGN KEY (id_restriction_gabarit) REFERENCES restriction_gabarit (id_restriction_gabarit),
                     CONSTRAINT pdc_id_acces_FK FOREIGN KEY (id_acces) REFERENCES condition_acces (id_acces)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: Avoir
-- ----------------------------
CREATE TABLE Avoir (
                       id_prise INT NOT NULL,
                       id_pdc_itinerance VARCHAR(128) NOT NULL,
                       CONSTRAINT Avoir_PK PRIMARY KEY (id_prise, id_pdc_itinerance),
                       CONSTRAINT Avoir_id_prise_FK FOREIGN KEY (id_prise) REFERENCES type_prise (id_prise),
                       CONSTRAINT Avoir_id_pdc_itinerance_FK FOREIGN KEY (id_pdc_itinerance) REFERENCES pdc (id_pdc_itinerance)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: PAYER
-- ----------------------------
CREATE TABLE PAYER (
                       id_pdc_itinerance VARCHAR(128) NOT NULL,
                       id_paiment INT NOT NULL,
                       CONSTRAINT PAYER_PK PRIMARY KEY (id_pdc_itinerance, id_paiment),
                       CONSTRAINT PAYER_id_pdc_itinerance_FK FOREIGN KEY (id_pdc_itinerance) REFERENCES pdc (id_pdc_itinerance),
                       CONSTRAINT PAYER_id_paiment_FK FOREIGN KEY (id_paiment) REFERENCES type_paiment (id_paiment)
)ENGINE=InnoDB;

