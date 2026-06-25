#!/usr/bin/python3
import argparse
import joblib
import sys
import pandas as pd
import warnings

# Masquer les avertissements de scikit-learn pour ne pas polluer la réponse PHP
warnings.filterwarnings("ignore")

def checkArguments():
    parser = argparse.ArgumentParser()
    parser.add_argument('-lat', '--latitude', type=float, required=True)
    parser.add_argument('-lon', '--longitude', type=float, required=True)
    return parser.parse_args()

if __name__ == '__main__':
    try:
        args = checkArguments()

        # 1. Charger le modèle pré-entraîné
        with open('modele_kmeans_k5.pkl', 'rb') as f:
            model = joblib.load(f)

        # 2. Préparer la donnée (L'ordre des colonnes doit être exactement celui de l'entraînement : lon, lat)
        data = pd.DataFrame([[args.longitude, args.latitude]], columns=['lon', 'lat'])

        # 3. Prédire le cluster
        prediction = model.predict(data)[0]

        # Scikit-learn numérote les clusters de 0 à 4.
        # Ton JS (obtenirCouleurCluster) attend de 1 à 5. On ajoute donc +1.
        cluster_final = prediction + 1

        # On affiche uniquement le numéro pour que PHP le récupère facilement
        print(cluster_final)

    except Exception as e:
        print(f"Erreur Python: {e}", file=sys.stderr)
        sys.exit(1)