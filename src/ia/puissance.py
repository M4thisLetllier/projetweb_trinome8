import sys
import json
import pandas as pd
import joblib
import os
import warnings

# On ignore les warnings pour garder un JSON propre
warnings.filterwarnings("ignore")

def main():
    try:
        # 1. Chargement dynamique du modèle
        # Cela trouve le dossier où se trouve ce script (puissance.py)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # On construit le chemin du fichier .pkl en le collant au dossier du script
        modele_path = os.path.join(script_dir, 'modele_prediction_puissance.pkl')
        
        modele = joblib.load(modele_path)
    except Exception as e:
        print(json.dumps({"erreur": f"Modèle introuvable ici: {modele_path}. Détail: {str(e)}"}))
        sys.exit(1)

    try:
        # 2. Récupération des données envoyées par PHP
        id_pdc = sys.argv[1] if len(sys.argv) > 1 else "Inconnu"

        # 3. Dictionnaire des caractéristiques
        caracteristiques_borne = {
            "prise_type_ef": 0,
            "prise_type_2": 1,
            "prise_type_combo_ccs": 1,
            "prise_type_chademo": 0,
            "prise_type_autre": 0,
            "gratuit": 0,
            "paiement_acte": 1,
            "paiement_cb": 1,
            "paiement_autre": 0,
            "reservation": 0,
            "station_deux_roues": 0,
            "cable_t2_attache": 1,
            "condition_acces": "Accès libre",
            "accessibilite_pmr": "Accessible non réservé",
            "implantation_station": "Voirie",
            "nbre_pdc": 4,
            "lon": 4.8320,  
            "lat": 45.7640
        }

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