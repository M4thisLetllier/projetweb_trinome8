import sys
import json
import pandas as pd
import joblib
import os
import mysql.connector
import warnings

# On ignore les warnings pour garder un JSON propre
warnings.filterwarnings("ignore")

# --- CONFIGURATION DE LA BASE DE DONNÉES ---
DB_CONFIG = {
    'host': 'db',
    'user': 'root',
    'password': 'motdepassesupersecret',
    'database': 'ma_base_de_dev'
}

def get_pdc_data(id_pdc):
    """Récupère les données du PDC depuis la base MySQL pour la prédiction de puissance"""
    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        # 1. Requête principale : Infos du PDC, de la Station, accès, accessibilité et implantation
        query_main = """
            SELECT
                p.latitude_pdc AS lat,
                p.longitude_pdc AS lon,
                s.nombre_pdc AS nbre_pdc,
                ca.denomination_acces AS condition_acces,
                ap.denomination_accessibilite AS accessibilite_pmr,
                imp.denomination_implantation AS implantation_station
            FROM pdc p
            JOIN station s ON p.id_station_itinerance = s.id_station_itinerance
            JOIN condition_acces ca ON p.id_acces = ca.id_acces
            JOIN Accessibilite_pmr ap ON p.id_accessibilite = ap.id_accessibilite
            JOIN implantation imp ON s.id_implantation = imp.id_implantation
            WHERE p.id_pdc_itinerance = %s
        """
        cursor.execute(query_main, (id_pdc,))
        pdc_info = cursor.fetchone()

        if not pdc_info:
            return None # PDC non trouvé

        # 2. Requête : Types de prises associées à ce PDC
        query_prises = """
            SELECT tp.denomination_prise
            FROM Avoir a
            JOIN type_prise tp ON a.id_prise = tp.id_prise
            WHERE a.id_pdc_itinerance = %s
        """
        cursor.execute(query_prises, (id_pdc,))
        prises = [row['denomination_prise'].lower() for row in cursor.fetchall()]

        # 3. Requête : Types de paiements associés à ce PDC
        query_paiements = """
            SELECT tpa.denomination_paiment
            FROM PAYER pa
            JOIN type_paiment tpa ON pa.id_paiment = tpa.id_paiment
            WHERE pa.id_pdc_itinerance = %s
        """
        cursor.execute(query_paiements, (id_pdc,))
        paiements = [row['denomination_paiment'].lower() for row in cursor.fetchall()]

        # --- Construction du dictionnaire final pour le modèle ---
        def check_presence(mots_cles, liste_donnees):
            return 1 if any(mot in item for item in liste_donnees for mot in mots_cles) else 0

        caracteristiques = {
            "prise_type_ef": check_presence(["ef", "domestique"], prises),
            "prise_type_2": check_presence(["t2", "type 2"], prises),
            "prise_type_combo_ccs": check_presence(["combo", "ccs"], prises),
            "prise_type_chademo": check_presence(["chademo"], prises),
            "prise_type_autre": check_presence(["autre", "type 3"], prises),

            "gratuit": check_presence(["gratuit"], paiements),
            "paiement_acte": check_presence(["acte"], paiements),
            "paiement_cb": check_presence(["cb", "carte", "bancaire"], paiements),
            "paiement_autre": check_presence(["autre", "badge", "abonnement"], paiements),

            # Attributs manquants dans le MCD, laissés par défaut
            "reservation": 0,
            "station_deux_roues": 0,
            "cable_t2_attache": 1,

            # Données issues de la BDD
            "condition_acces": pdc_info['condition_acces'],
            "accessibilite_pmr": pdc_info['accessibilite_pmr'],
            "implantation_station": pdc_info['implantation_station'],
            "nbre_pdc": int(pdc_info['nbre_pdc']) if pdc_info['nbre_pdc'] else 1,
            "lon": float(pdc_info['lon']),
            "lat": float(pdc_info['lat'])
        }

        return caracteristiques

    except mysql.connector.Error as err:
        raise Exception(f"Erreur Base de données : {err}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def main():
    try:
        # 1. Chargement dynamique du modèle
        script_dir = os.path.dirname(os.path.abspath(__file__))
        modele_path = os.path.join(script_dir, 'modele_prediction_puissance.pkl')
        modele = joblib.load(modele_path)
    except Exception as e:
        print(json.dumps({"erreur": f"Modèle introuvable ici: {modele_path}. Détail: {str(e)}"}))
        sys.exit(1)

    try:
        # 2. Récupération des données envoyées par PHP
        id_pdc = sys.argv[1] if len(sys.argv) > 1 else None

        if not id_pdc or id_pdc == "Inconnu":
            print(json.dumps({"erreur": "Aucun ID de point de charge fourni au script."}))
            sys.exit(1)

        # 3. Récupération des données depuis la BDD
        caracteristiques_borne = get_pdc_data(id_pdc)

        if not caracteristiques_borne:
            print(json.dumps({"erreur": f"Point de charge {id_pdc} introuvable dans la base de données."}))
            sys.exit(1)

        # 4. Prédiction
        df_input = pd.DataFrame([caracteristiques_borne])
        prediction = modele.predict(df_input)[0]

        # 5. Renvoi au site Web en JSON
        print(json.dumps({
            "borne_analysee": id_pdc,
            "prediction_IA": f"{prediction:.2f} kW"
        }))

    except Exception as e:
        print(json.dumps({"erreur": f"Erreur de calcul : {str(e)}"}))

if __name__ == "__main__":
    main()