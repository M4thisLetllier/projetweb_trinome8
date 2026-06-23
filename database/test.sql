-- ----------------------------------------------------------
-- Insertion de données de test fictives (IRVE DataStudio)
-- ----------------------------------------------------------

-- 1. Alimentation des tables de base (Configuration)
INSERT INTO region (id_region, denomination_region) VALUES 
(1, 'Bretagne'),
(2, 'Normandie'),
(3, 'Pays de la Loire');

INSERT INTO departement (num_dep, denomination_dep, id_region) VALUES 
(29, 'Finistère', 1),
(14, 'Calvados', 2),
(44, 'Loire-Atlantique', 3);

INSERT INTO commune (code_commune_insee, code_postal, nom_commune, latitude_centroide, longitude_centroide, num_dep) VALUES 
(29019, 29200, 'Brest', 48.39, -4.49, 29),
(14118, 14000, 'Caen', 49.18, -0.37, 14),
(44109, 44000, 'Nantes', 47.22, -1.55, 44);

INSERT INTO type_prise (id_prise, denomination_prise) VALUES 
(1, 'Combo CCS'),
(2, 'Type 2 / T2S'),
(3, 'CHAdeMO');

INSERT INTO type_paiment (id_paiment, denomination_paiment) VALUES 
(1, 'Carte Bancaire'),
(2, 'Application Mobile'),
(3, 'Badge Abonné');

INSERT INTO amenageur (id_amenageur, nom_amenageur, contact_amenageur) VALUES 
(101, 'TotalEnergies', 'contact@totalenergies.fr'),
(102, 'Ionity France', 'support@ionity.eu'),
(103, 'EDF Pulse', 'info@edf-pulse.fr');

INSERT INTO operateur (id_operateur, nom_operateur, contact_operateur, telephone_operateur) VALUES 
(201, 'TotalEnergies Operation', 'ops@total.fr', '0102030405'),
(202, 'Ionity Ops', 'ops@ionity.eu', '0607080910'),
(203, 'Izivia', 'contact@izivia.com', '0800100200');

INSERT INTO Enseigne (id_enseigne, nom_enseigne) VALUES 
(1, 'TotalEnergies Charge'),
(2, 'Ionity'),
(3, 'EDF Pulse Station');

INSERT INTO horraire (id_horraire, denomination_horraire) VALUES 
(1, '24h/24 - 7j/7');

INSERT INTO implatation (id_implantation, denomination_implatation) VALUES 
(1, 'Station sur voirie'),
(2, 'Aire de covoiturage / autoroute');

INSERT INTO Accessibilite_pmr (id_accessibilite, denomination_accessibilite) VALUES 
(1, 'Accessible PMR');

INSERT INTO restriction_gabarit (id_restriction_gabarit, denomination) VALUES 
(1, 'Aucune restriction');

INSERT INTO condition_acces (id_acces, denomination_acces) VALUES 
(1, 'Accès libre');


-- 2. Alimentation des Stations (Regroupements géographiques)
INSERT INTO station (id_station_itinerance, nom_station, adresse_station, nombre_pdc, date_mise_service, id_implantation, id_amenageur, id_operateur, code_commune_insee, id_enseigne, id_horraire) VALUES 
('FR-TOTAL-ST01', 'Brest-Centre', 'Place de la Liberté, 29200 Brest', 4, '2025-01-15', 1, 101, 201, 29019, 1, 1),
('FR-IONITY-ST02', 'Calvados-Ionity', 'Aire de Caen, 14000 Caen', 6, '2025-03-20', 2, 102, 202, 14118, 2, 1),
('FR-EDFP-ST03', 'Nantes-Pulse', 'Centre-Ville, 44000 Nantes', 2, '2025-05-10', 1, 103, 203, 44109, 3, 1);


-- 3. Alimentation des Points de Charge (PDC)
-- Contient l'ID, la puissance nominale, la latitude et la longitude nécessaires pour votre script JavaScript / Carte Leaflet
INSERT INTO pdc (id_pdc_itinerance, puissance_nominale, tarif, latitude_pdc, longitude_pdc, date_maj, id_station_itinerance, id_accessibilite, id_restriction_gabarit, id_acces) VALUES 
('FR-881-01', 50, 0.45, 48.3903, -4.4861, '2026-06-01', 'FR-TOTAL-ST01', 1, 1, 1),
('FR-142-03', 350, 0.69, 49.1828, -0.3707, '2026-06-02', 'FR-IONITY-ST02', 1, 1, 1),
('FR-443-12', 22, 0.35, 47.2184, -1.5536, '2026-06-03', 'FR-EDFP-ST03', 1, 1, 1);


-- 4. Alimentation des tables de liaison (Prises et Paiements par PDC)
INSERT INTO Avoir (id_prise, id_pdc_itinerance) VALUES 
(1, 'FR-881-01'), -- Combo CCS pour Brest
(2, 'FR-142-03'), -- Type 2 pour Caen
(3, 'FR-443-12'); -- CHAdeMO pour Nantes

INSERT INTO PAYER (id_pdc_itinerance, id_paiment) VALUES 
('FR-881-01', 1), ('FR-881-01', 3), -- CB et Badge pour Brest
('FR-142-03', 1), ('FR-142-03', 2), -- CB et App pour Caen
('FR-443-12', 3);                   -- Badge uniquement pour Nantes