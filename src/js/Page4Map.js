document.addEventListener("DOMContentLoaded", () => {
    // Initialisation de la carte Leaflet centrée sur la France
    const map = L.map('map').setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    document.addEventListener("DOMContentLoaded", () => {
    // Initialisation de la carte Leaflet centrée sur la France
    const map = L.map('map').setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 🔥 FORCE LEAFLET À RECALCULER SA TAILLE IMMÉDIATEMENT
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // Ton code Fetch (Même s'il ne renvoie rien pour l'instant, le fond de carte doit s'afficher !)
    fetch("api-clusters.php")
        .then(response => response.json())
        .then(bornes => {
            // ... (ton code de traitement des marqueurs reste identique)
        })
        .catch(error => console.error("Erreur clusters :", error));
});

    // Requête AJAX pour récupérer les points avec leur cluster
    fetch("api-clusters.php")
        .then(response => response.json())
        .then(bornes => {
            bornes.forEach(borne => {
                let color = "#cbd5e1"; // Couleur par défaut si problème

                // Attribution de la couleur selon le cluster calculé
                if (borne.cluster === 1 || borne.cluster === "1") color = "#2e7d32"; // Vert
                else if (borne.cluster === 2 || borne.cluster === "2") color = "#1565c0"; // Bleu
                else if (borne.cluster === 3 || borne.cluster === "3") color = "#ef6c00"; // Orange

                // Ajout d'un marqueur circulaire pour un rendu "nuage de points" propre
                L.circleMarker([parseFloat(borne.latitude_pdc), parseFloat(borne.longitude_pdc)], {
                    radius: 6,
                    fillColor: color,
                    color: "#ffffff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9
                })
                .addTo(map)
                .bindPopup(`
                    <strong>ID :</strong> ${borne.id_pdc_itinerance}<br>
                    <strong>Puissance :</strong> ${borne.puissance_nominale} kW<br>
                    <strong>Cluster IA :</strong> Groupe ${borne.cluster}
                `);
            });
        })
        .catch(error => console.error("Erreur lors du chargement des clusters :", error));
});