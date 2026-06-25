/**
 * IRVE DataStudio - Contrôleur de Clustering IA
 * FISE3 - 2026
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialisation de la carte Leaflet centrée sur la France
    const map = L.map('map').setView([46.603354, 1.888334], 5.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Groupe pour pouvoir ajouter des marqueurs dynamiquement
    const markersGroup = L.layerGroup().addTo(map);

    // Forcer le recalcul de la taille de la carte pour éviter le bug d'affichage gris
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // Fonction utilitaire pour choisir la couleur lors de la prédiction (POST)
    function obtenirCouleurCluster(clusterNum) {
        const c = parseInt(clusterNum);
        if (c === 1) return "#2e7d32"; // Vert
        if (c === 2) return "#1565c0"; // Bleu
        if (c === 3) return "#ef6c00"; // Orange
        if (c === 4) return "#9c27b0"; // Violet
        if (c === 5) return "#795548"; // Brun
        return "#000000";
    }

    // 2. REQUÊTE AJAX : Chargement des Centroïdes (en GET)
    ajaxRequest("../request.php/clusters", "GET", function(clusters) {
        if (clusters && clusters.length > 0) {
            clusters.forEach(cluster => {
                // Récupération des données du JSON (modifié selon ta nouvelle table)
                const lat = parseFloat(cluster.latitude_centroide);
                const lon = parseFloat(cluster.longitude_centroide);
                const color = cluster.couleur;
                const id = cluster.id_cluster;

                if (!isNaN(lat) && !isNaN(lon)) {
                    // A. Le "Rond" large représentant la zone d'influence du cluster
                    L.circle([lat, lon], {
                        radius: 70000, // Rayon en mètres (ici 70km) - Ajustable selon tes besoins !
                        fillColor: color,
                        color: color,
                        weight: 2,
                        opacity: 0.6,
                        fillOpacity: 0.15 // Très transparent
                    }).addTo(markersGroup);

                    // B. Le point central bien net (le vrai centroïde exact)
                    L.circleMarker([lat, lon], {
                        radius: 7,
                        fillColor: color,
                        color: "#ffffff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    })
                        .addTo(markersGroup)
                        .bindPopup(`
                        <div style="text-align:center;">
                            <strong>Centroïde du Cluster ${id}</strong><br>
                            Lat: ${lat.toFixed(4)} | Lon: ${lon.toFixed(4)}
                        </div>
                    `);
                }
            });
        }
    }, null);

    // 3. GESTION DU FORMULAIRE DE PRÉDICTION UNITAIRE (Saisie manuelle POST)
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
            ajaxRequest("../request.php/clusters", "POST", function(reponse) {
                if (reponse && reponse.success) {
                    const clusterTrouve = reponse.cluster;
                    const couleur = obtenirCouleurCluster(clusterTrouve);

                    // --- CREATION D'UN PINS (MARQUEUR) SVG PERSONNALISÉ ---
                    // On génère une icône SVG à la volée avec la couleur du cluster injectée
                    const pinIcon = L.divIcon({
                        className: 'custom-pin', // Permet de retirer le style par défaut
                        html: `<svg viewBox="0 0 24 24" fill="${couleur}" width="40px" height="40px" stroke="#000000" stroke-width="1">
                                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                               </svg>`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40], // Le "bout" de l'épingle doit toucher le sol (Milieu, Bas)
                        popupAnchor: [0, -35] // La bulle s'ouvrira juste au dessus du Pins
                    });

                    // Ajout du marqueur "Pins" sur la carte avec l'icône personnalisée
                    const nouveauMarqueur = L.marker([lat, lon], { icon: pinIcon })
                        .addTo(map)
                        .bindPopup(`
                        <div style="text-align:center;">
                            <strong style="color:var(--primary-color);">Nouvelle Implantation Testée</strong><br>
                            Lat: ${lat} | Lon: ${lon}<br>
                            <span style="font-size:1.1rem;"><strong>Cluster prédit : ${clusterTrouve}</strong></span>
                        </div>
                    `)
                        .openPopup();

                    // Animer doucement la carte pour se centrer sur le point prédit
                    map.flyTo([lat, lon], 8, { duration: 1.5 });

                } else {
                    alert("Erreur lors de la prédiction : " + (reponse.erreur || "Réponse invalide du serveur."));
                }
            }, donneesAEnvoyer);
        });
    }
});