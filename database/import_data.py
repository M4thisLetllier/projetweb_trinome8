import csv
import mysql.connector

from datetime import datetime

# Configuration de la connexion Docker MySQL
# Meme que dans le fichier constante
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'motdepassesupersecret',
    'database': 'ma_base_de_dev'
}

CSV_FILE_PATH = 'IRVE_clean_FINAL.csv'



def main():
    print("Connexion à la base de données MySQL...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # --- 2. Les departement et region depuis le csv
    print("Lecture csv departement et ecriture database ...")
    with open("departements-france.csv", newline='') as depfile:
        readerdep = csv.DictReader(depfile)
        for row_idx, row in enumerate(readerdep, start=1):
            code_dep_str = row.get('code_departement', '').strip()
            nom_dep = row.get('nom_departement', '').strip()

            code_reg_str = row.get('code_region', '').strip()
            code_region = int(code_reg_str)

            nom_region = row.get('nom_region', '').strip()

            # Gestion du type INT pour la Corse (2A -> 200, 2B -> 201)
            if code_dep_str == '2A':
                num_dep = 200
            elif code_dep_str == '2B':
                num_dep = 201
            else:
                num_dep = int(code_dep_str)

            # On cherche si la région existe déjà via son code
            cursor.execute("SELECT id_region FROM region WHERE id_region = %s", (code_region,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO region (id_region, denomination_region) VALUES (%s, %s)",
                    (code_region, nom_region)
                )

            # On cherche si le département existe déjà
            cursor.execute("SELECT num_dep FROM departement WHERE num_dep = %s", (num_dep,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO departement (num_dep, denomination_dep, id_region) VALUES (%s, %s, %s)",
                    (num_dep, nom_dep, code_region)
                )
    # --- 3. Les communes
    with open("base-officielle-codes-postaux.csv", mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)

        for row_idx, row in enumerate(reader, start=1):
            try:
                #EXTRACTION DES DONNEES BRUTES
                r_insee = row.get('code_commune_insee', '').strip()
                r_nom = row.get('nom_de_la_commune', '').strip()
                r_cp = row.get('code_postal', '').strip()
                r_lat = row.get('latitude', '').strip()
                r_lon = row.get('longitude', '').strip()

                # On ignore les lignes vides ou sans code INSEE
                if not r_insee or not r_nom:
                    continue
                #CALCUL DU DEPARTEMENT & NETTOYAGE

                # 1. Déduction du département (les 2 premiers caractères)
                dep_str = r_insee[:2]
                if dep_str == '2A':
                    num_dep = 200
                elif dep_str == '2B':
                    num_dep = 201
                else:
                    num_dep = int(dep_str)

                # 2. Nettoyage du code INSEE pour la base (qui attend un INT)
                # Remplacement des lettres de la Corse pour ne pas faire planter Python/MySQL
                insee_clean = r_insee.replace('A', '0').replace('B', '1')
                code_insee = int(insee_clean)

                # 3. Typage des autres données
                code_postal = int(r_cp) if r_cp else None
                lat = float(r_lat) if r_lat else 0.0
                lon = float(r_lon) if r_lon else 0.0

                #INSERTION EN BASE DE DONNEES
                cursor.execute(
                    "INSERT IGNORE INTO commune (code_commune_insee, code_postal, nom_commune, latitude_centroide, longitude_centroide, num_dep) VALUES (%s, %s, %s, %s, %s, %s)",
                    (code_insee, code_postal, r_nom, lat, lon, num_dep)
                )

            except Exception as e:
                print(f"⚠️ Erreur à la ligne {row_idx} ({row.get('nom_de_la_commune', 'Inconnu')}) : {e}")

    # --- 4. PRISES et Paiment table intermédiaire donc on les précharges ---
    prises_types = {'prise_type_ef': "Type EF", 'prise_type_2': "Type 2", 'prise_type_combo_ccs': "Combo CCS",
                    'prise_type_chademo': "CHAdeMO", 'prise_type_autre': "Autre"}
    prises_ids = {}
    for col, name in prises_types.items():
        cursor.execute("INSERT INTO type_prise (denomination_prise) VALUES (%s)", (name,))
        prises_ids[col] = cursor.lastrowid

    paiements_types = {'gratuit': "Gratuit", 'paiement_acte': "Paiement à l'acte", 'paiement_cb': "Paiement par CB",
                       'paiement_autre': "Autre"}
    paiements_ids = {}
    for col, name in paiements_types.items():
        cursor.execute("INSERT INTO type_paiment (denomination_paiment) VALUES (%s)", (name,))
        paiements_ids[col] = cursor.lastrowid

    print("Lecture et importation du fichier CSV...")

    # --- 5. TRAITEMENT DU CSV ---
    with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row_idx, row in enumerate(reader, start=1):
            try:
                # ==========================================
                # EXTRACTION ET NETTOYAGE INLINE
                # ==========================================

                # Aménageur
                r_am = row.get('nom_amenageur')
                nom_am = r_am.strip() if r_am and r_am not in ('NA', '') else None
                r_cam = row.get('contact_amenageur')
                contact_am = r_cam.strip() if r_cam and r_cam not in ('NA', '') else None

                # Opérateur
                r_op = row.get('nom_operateur')
                nom_op = r_op.strip() if r_op and r_op not in ('NA', '') else None
                r_cop = row.get('contact_operateur')
                contact_op = r_cop.strip() if r_cop and r_cop not in ('NA', '') else None
                r_top = row.get('telephone_operateur')
                tel_op = r_top.strip() if r_top and r_top not in ('NA', '') else None

                # Implantation
                r_imp = row.get('implantation_station')
                nom_imp = r_imp.strip() if r_imp and r_imp not in ('NA', '') else None

                # Enseigne
                r_ens = row.get('nom_enseigne')
                nom_ens = r_ens.strip() if r_ens and r_ens not in ('NA', '') else None

                # Horaire
                r_hor = row.get('horaires')
                nom_hor = r_hor.strip() if r_hor and r_hor not in ('NA', '') else None

                # Accessibilité
                r_acc_pmr = row.get('accessibilite_pmr')
                nom_acc_pmr = r_acc_pmr.strip() if r_acc_pmr and r_acc_pmr not in ('NA', '') else None

                # Restriction
                r_rest = row.get('restriction_gabarit')
                nom_rest = r_rest.strip() if r_rest and r_rest not in ('NA', '') else None

                # Condition acces
                r_cond = row.get('condition_acces')
                nom_cond = r_cond.strip() if r_cond and r_cond not in ('NA', '') else None

                # Coordonnées
                r_lat = row.get('lat')
                lat = float(r_lat) if r_lat and r_lat not in ('NA', '') else None
                r_lon = row.get('lon')
                lon = float(r_lon) if r_lon and r_lon not in ('NA', '') else None

                # Station
                r_id_stat = row.get('id_station_itinerance')
                id_station = r_id_stat.strip() if r_id_stat and r_id_stat not in ('NA', '') else None
                r_nom_stat = row.get('nom_station')
                nom_station = r_nom_stat.strip() if r_nom_stat and r_nom_stat not in ('NA', '') else None
                r_adr = row.get('adresse_station')
                adresse = r_adr.strip() if r_adr and r_adr not in ('NA', '') else None
                r_nb = row.get('nbre_pdc')
                nbre_pdc = int(float(r_nb)) if r_nb and r_nb not in ('NA', '') else None
                r_date_ms = row.get('date_mise_en_service')
                date_ms = r_date_ms.strip() if r_date_ms and r_date_ms not in ('NA', '') else None

                # PDC
                r_id_pdc = row.get('id_pdc_itinerance')
                id_pdc = r_id_pdc.strip() if r_id_pdc and r_id_pdc not in ('NA', '') else None
                r_puiss = row.get('puissance_nominale')
                puissance = int(float(r_puiss)) if r_puiss and r_puiss not in ('NA', '') else None
                r_tarif = row.get('tarif_kwh_clean')
                tarif = float(r_tarif) if r_tarif and r_tarif not in ('NA', '') else None
                r_maj = row.get('date_maj')
                date_maj = r_maj.strip() if r_maj and r_maj not in ('NA', '') else None

                # ==========================================
                #INSERTIONS EN BASE DE DONNEES
                # ==========================================

                # 1. Aménageur
                id_amenageur = None
                if nom_am:
                    cursor.execute("SELECT id_amenageur FROM amenageur WHERE nom_amenageur = %s", (nom_am,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_amenageur = db_row[0]
                    else:
                        cursor.execute("INSERT INTO amenageur (nom_amenageur, contact_amenageur) VALUES (%s, %s)",
                                       (nom_am, contact_am))
                        id_amenageur = cursor.lastrowid

                # 2. Opérateur
                id_operateur = None
                if nom_op:
                    cursor.execute("SELECT id_operateur FROM operateur WHERE nom_operateur = %s", (nom_op,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_operateur = db_row[0]
                    else:
                        cursor.execute(
                            "INSERT INTO operateur (nom_operateur, contact_operateur, telephone_operateur) VALUES (%s, %s, %s)",
                            (nom_op, contact_op, tel_op))
                        id_operateur = cursor.lastrowid

                # 3. Implantation
                id_implantation = None
                if nom_imp:
                    cursor.execute("SELECT id_implantation FROM implantation WHERE denomination_implantation = %s",
                                   (nom_imp,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_implantation = db_row[0]
                    else:
                        cursor.execute("INSERT INTO implantation (denomination_implantation) VALUES (%s)", (nom_imp,))
                        id_implantation = cursor.lastrowid

                # 4. Enseigne
                id_enseigne = None
                if nom_ens:
                    cursor.execute("SELECT id_enseigne FROM Enseigne WHERE nom_enseigne = %s", (nom_ens,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_enseigne = db_row[0]
                    else:
                        cursor.execute("INSERT INTO Enseigne (nom_enseigne) VALUES (%s)", (nom_ens,))
                        id_enseigne = cursor.lastrowid

                # 5. Horaire
                id_horaire = None
                if nom_hor:
                    cursor.execute("SELECT id_horaire FROM horaire WHERE denomination_horaire = %s", (nom_hor,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_horaire = db_row[0]
                    else:
                        cursor.execute("INSERT INTO horaire (denomination_horaire) VALUES (%s)", (nom_hor,))
                        id_horaire = cursor.lastrowid

                # 6. Accessibilité PMR
                id_accessibilite = None
                if nom_acc_pmr:
                    cursor.execute(
                        "SELECT id_accessibilite FROM Accessibilite_pmr WHERE denomination_accessibilite = %s",
                        (nom_acc_pmr,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_accessibilite = db_row[0]
                    else:
                        cursor.execute("INSERT INTO Accessibilite_pmr (denomination_accessibilite) VALUES (%s)",
                                       (nom_acc_pmr,))
                        id_accessibilite = cursor.lastrowid

                # 7. Restriction gabarit
                id_restriction = None
                if nom_rest:
                    cursor.execute("SELECT id_restriction_gabarit FROM restriction_gabarit WHERE denomination = %s",
                                   (nom_rest,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_restriction = db_row[0]
                    else:
                        cursor.execute("INSERT INTO restriction_gabarit (denomination) VALUES (%s)", (nom_rest,))
                        id_restriction = cursor.lastrowid

                # 8. Condition accès
                id_acces = None
                if nom_cond:
                    cursor.execute("SELECT id_acces FROM condition_acces WHERE denomination_acces = %s", (nom_cond,))
                    db_row = cursor.fetchone()
                    if db_row:
                        id_acces = db_row[0]
                    else:
                        cursor.execute("INSERT INTO condition_acces (denomination_acces) VALUES (%s)", (nom_cond,))
                        id_acces = cursor.lastrowid

                # 10. Station
                r_insee = row.get('code_insee_commune')
                if r_insee and r_insee not in ('NA', ''):
                    insee_clean = r_insee.strip().replace('A', '0').replace('B', '1')
                    code_insee = int(insee_clean)
                else:
                    code_insee = None

                if id_station:
                    cursor.execute("SELECT id_station_itinerance FROM station WHERE id_station_itinerance = %s",
                                   (id_station,))
                    if not cursor.fetchone():
                        cursor.execute(
                            "INSERT INTO station (id_station_itinerance, nom_station, adresse_station, nombre_pdc, date_mise_service, id_implantation, id_amenageur, id_operateur, code_commune_insee, id_enseigne, id_horaire) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                            (id_station, nom_station, adresse, nbre_pdc, date_ms, id_implantation, id_amenageur,
                             id_operateur, code_insee, id_enseigne, id_horaire)
                        )

                # 11. PDC
                if id_pdc:
                    cursor.execute("SELECT id_pdc_itinerance FROM pdc WHERE id_pdc_itinerance = %s", (id_pdc,))
                    if not cursor.fetchone():
                        cursor.execute(
                            "INSERT INTO pdc (id_pdc_itinerance, puissance_nominale, tarif, latitude_pdc, longitude_pdc, date_maj, id_station_itinerance, id_accessibilite, id_restriction_gabarit, id_acces) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                            (id_pdc, puissance, tarif, lat, lon, date_maj, id_station, id_accessibilite, id_restriction,
                             id_acces)
                        )

                        # 12. Liaison Prises (Avoir)
                        for col_prise, pr_id in prises_ids.items():
                            r_prise = row.get(col_prise)
                            is_present = int(float(r_prise)) if r_prise and r_prise not in ('NA', '') else 0
                            if is_present == 1:
                                cursor.execute("INSERT INTO Avoir (id_prise, id_pdc_itinerance) VALUES (%s, %s)",
                                               (pr_id, id_pdc))

                        # 13. Liaison Paiement (PAYER)
                        for col_pay, pay_id in paiements_ids.items():
                            r_pay = row.get(col_pay)
                            is_present = int(float(r_pay)) if r_pay and r_pay not in ('NA', '') else 0
                            if is_present == 1:
                                cursor.execute(
                                    "INSERT INTO PAYER (id_pdc_itinerance, id_paiment) VALUES (%s, %s)",
                                    (id_pdc, pay_id))

            except Exception as e:
                print(f"Erreur à l'indice {id_pdc,code_insee} à la ligne {row_idx} : {e}")
    # Validation définitive des requêtes
    conn.commit()
    cursor.close()
    conn.close()


if __name__ == '__main__':
    main()

