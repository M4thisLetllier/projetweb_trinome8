/**
 * IRVE DataStudio - Contrôleur de Clustering IA
 * FISE3 - 2026
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialisation de la carte Leaflet centrée sur la France
    const map = L.map('map').setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Groupe pour pouvoir ajouter des marqueurs dynamiquement
    const markersGroup = L.layerGroup().addTo(map);

    // Forcer le recalcul de la taille de la carte pour éviter le bug d'affichage gris
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // Fonction utilitaire pour choisir la couleur selon le cluster renvoyé (1 à 5)
    function obtenirCouleurCluster(clusterNum) {
        const c = parseInt(clusterNum);
        if (c === 1) return "#2e7d32"; // Vert
        if (c === 2) return "#1565c0"; // Bleu
        if (c === 3) return "#ef6c00"; // Orange
        if (c === 4) return "#9c27b0"; // Violet
        return "#795548"; // Brun par défaut pour les autres clusters
    }

    // 2. REQUÊTE AJAX : Chargement global des points existants via ajax.js (en GET)
    ajaxRequest("api-clusters.php", "GET", function(bornes) {
        if (bornes && bornes.length > 0) {
            bornes.forEach(borne => {
                if (borne.latitude_pdc && borne.longitude_pdc) {
                    const color = obtenirCouleurCluster(borne.cluster);

                    L.circleMarker([parseFloat(borne.latitude_pdc), parseFloat(borne.longitude_pdc)], {
                        radius: 5,
                        fillColor: color,
                        color: "#ffffff",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    })
                    .addTo(markersGroup)
                    .bindPopup(`
                        <strong>ID :</strong> ${borne.id_pdc_itinerance || 'Inconnu'}<br>
                        <strong>Puissance :</strong> ${borne.puissance_nominale || '--'} kW<br>
                        <strong>Cluster IA :</strong> Groupe ${borne.cluster}
                    `);
                }
            });
        }
    }, null);

    // 3. GESTION DU FORMULAIRE DE PRÉDICTION UNITAIRE (Saisie manuelle)
    const btnPredire = document.getElementById("btn-predire-unitaire");
    const inputLat = document.getElementById("manual-lat");
    const inputLon = document.getElementById("manual-lon");

    if (btnPredire) {
        btnPredire.addEventListener("click", () => {
            const lat = parseFloat(inputLat.value);
            const lon = parseFloat(inputLon.value);

            if (isNaN(lat) || isNaN(lon)) {
                alert("Veuillez saisir des coordonnées valides (Latitude et Longitude numériques).");
                return;
            }

            // Données à envoyer en POST
            const donneesAEnvoyer = {
                latitude: lat,
                longitude: lon
            };

            // Appel AJAX en POST utilisant ton fichier ajax.js
            ajaxRequest("api-predire-unitaire.php", "POST", function(reponse) {
                if (reponse && reponse.success) {
                    const clusterTrouve = reponse.cluster;
                    const couleur = obtenirCouleurCluster(clusterTrouve);

                    // Ajout d'un marqueur spécial (plus gros et animé/marqué) pour la nouvelle prédiction
                    const nouveauMarqueur = L.circleMarker([lat, lon], {
                        radius: 10, // Plus gros pour le repérer immédiatement
                        fillColor: couleur,
                        color: "#000000", // Contour noir pour le faire ressortir
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    })
                    .addTo(map) // Ajouté directement sur la carte globale
                    .bindPopup(`
                        <div style="text-align:center;">
                            <strong style="color:var(--primary-color);">Nouvelle Implantation Testée</strong><br>
                            Lat: ${lat} | Lon: ${lon}<br>
                            <span style="font-size:1.1rem;">🔮 <strong>Cluster prédit : ${clusterTrouve}</strong></span>
                        </div>
                    `)
                    .openPopup();

                    // Centrer la carte sur le nouveau point prédit
                    map.setView([lat, lon], 10);
                } else {
                    alert("Erreur lors de la prédiction : " + (reponse.erreur || "Réponse invalide du serveur."));
                }
            }, donneesAEnvoyer);
        });
    }
});