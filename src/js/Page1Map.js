/**
 * IRVE DataStudio - Contrôleur JavaScript Principal
 * FISE3 - 2026
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. INITIALISATION DE LA CARTE (Leaflet)
    // ==========================================
    const map = L.map('map').setView([46.2276, 2.2137], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Groupe pour stocker l'ensemble des marqueurs de la carte
    const markersGroup = L.layerGroup().addTo(map);

    // ==========================================
    // 2. SÉLECTION DES ÉLÉMENTS DE LA VUE (DOM)
    // ==========================================
    const tableBody = document.getElementById("table-body");
    const infoPopup = document.getElementById("info-popup");
    const popupStationName = document.getElementById("popup-station-name");
    const popupAdresse = document.getElementById("popup-adresse");
    const popupBornes = document.getElementById("popup-bornes");
    const popupPuissance = document.getElementById("popup-puissance");

    // ==========================================
    // 3. REQUÊTE AJAX AVEC TON FONCTIONNEMENT AJAX.JS
    // ==========================================
    function chargerDonneesIRVE() {
        ajaxRequest('api-bornes.php', 'GET', function(donnees) {
            if (donnees && donnees.length > 0) {
                genererInterfaceDynamique(donnees);
            } else {
                console.warn("Aucune donnée reçue du serveur.");
            }
        }, null);
    }

    // ==========================================
    // 4. GÉNÉRATION DU TABLEAU ET DES MARQUEURS
    // ==========================================
    function genererInterfaceDynamique(stations) {
        tableBody.innerHTML = ""; 
        markersGroup.clearLayers(); // Nettoyage de la carte

        stations.forEach((station) => {
            // --- A. RENDU DU TABLEAU DE GAUCHE ---
            const row = document.createElement("tr");
            
            // Structure des cellules correspondant aux th du HTML
            row.innerHTML = `
                <td class="id-point">${station.id_pdc_itinerance || '--'}</td>
                <td>${station.nom_amenageur || '--'}</td>
                <td>${station.denomination_dep || '--'}</td>
                <td class="bold">${station.puissance_nominale || '--'} kW</td>
                <td>${station.denomination_prise || '--'}</td>
                <td>${station.denomination_paiment || '--'}</td>
            `;

            // Événement Hover sur le tableau de gauche
            row.addEventListener("mouseenter", () => {
                const allRows = tableBody.querySelectorAll("tr");
                allRows.forEach(r => r.classList.remove("selected"));
                row.classList.add("selected");
                
                afficherInfosPopup(station);
                
                if (station.latitude_pdc && station.longitude_pdc) {
                    map.setView([Number(station.latitude_pdc), Number(station.longitude_pdc)], 14);
                }
            });

            row.addEventListener("mouseleave", () => {
                 row.classList.remove("selected");
                 infoPopup.style.display = "none"; 
            });

            tableBody.appendChild(row);

            // --- B. RENDU DES BORNES SUR LA CARTE DE DROITE ---
            if (station.latitude_pdc && station.longitude_pdc) {
                const lat = Number(station.latitude_pdc);
                const lng = Number(station.longitude_pdc);

                if (!isNaN(lat) && !isNaN(lng)) {
                    const marker = L.marker([lat, lng]);

                    // Événement Hover sur le marqueur
                    marker.on('mouseover', () => {
                        afficherInfosPopup(station);
                    });

                    marker.on('mouseout', () => {
                        infoPopup.style.display = "none";
                    });

                    markersGroup.addLayer(marker);
                }
            }
        });

        map.invalidateSize();
    }

    // ==========================================
    // 5. AFFICHAGE ET MISE À JOUR DE LA POPUP
    // ==========================================
    function afficherInfosPopup(donneesStation) {
        popupStationName.textContent = `Commune : ${donneesStation.nom_commune || '--'}`;
        popupAdresse.textContent = `Prise : ${donneesStation.denomination_prise || '--'}`;
        popupBornes.textContent = `Paiement : ${donneesStation.denomination_paiment || '--'}`;
        popupPuissance.textContent = `${donneesStation.puissance_nominale || '--'} kW`;

        infoPopup.style.display = "block";
    }

    chargerDonneesIRVE();
});