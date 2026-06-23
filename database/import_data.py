import csv
import mysql.connector
import numpy as np
import pandas as pd
from datetime import datetime

# Configuration de la connexion Docker MySQL
#Meme que dans le fichier constante
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
    print("Ajout des régions ...")
    regions = ["Auvergne-Rhône-Alpes", "Hauts-de-France", "Provence-Alpes-Côte d'Azur",
              "Grand Est","Occitanie", "Nouvelle-Aquitaine",
              "Normandie","Corse", "Centre-Val de Loire",
              "Pays de la Loire","Bretagne","La Réunion",
              "Mayotte", "Guyane","Guadeloupe","Martinique","Bourgogne-Franche-Comté"]

    for region in regions:
        cursor.execute(
            "INSERT INTO region (denomination_region) VALUES (%s)",
            [region]
        )
    # Validation définitive des requêtes
    conn.commit()
    cursor.close()
    conn.close()


if __name__ == '__main__':
    main()