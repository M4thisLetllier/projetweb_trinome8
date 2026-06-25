import joblib  # <-- Remplacement de pickle par joblib
import mysql.connector

db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'motdepassesupersecret',
    'database': 'ma_base_de_dev'
}

couleurs = {
    1: "#2e7d32", 2: "#1565c0", 3: "#ef6c00", 4: "#9c27b0", 5: "#795548"
}


def main():
    print("Connexion à la base de données...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    print("Chargement du modèle KMeans avec joblib...")
    # CORRECTION ICI : chargement avec joblib
    model = joblib.load('modele_kmeans_k5.pkl')

    centers = model.cluster_centers_

    print("Insertion des centroïdes en base de données...")
    for i, center in enumerate(centers):
        id_cluster = i + 1
        lon = float(center[0])
        lat = float(center[1])
        couleur = couleurs[id_cluster]

        cursor.execute("""
            INSERT IGNORE INTO cluster (id_cluster, latitude_centroide, longitude_centroide, couleur) 
            VALUES (%s, %s, %s, %s)
        """, (id_cluster, lat, lon, couleur))

        print(f"Cluster {id_cluster} ajouté : Lat {lat:.4f}, Lon {lon:.4f} ({couleur})")

    conn.commit()
    cursor.close()
    conn.close()
    print("Importation terminée avec succès !")


if __name__ == '__main__':
    main()