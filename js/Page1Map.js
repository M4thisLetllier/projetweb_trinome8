/**
 * IRVE DataStudio - Contrôleur JavaScript Principal
 * Utilise la fonction générique ajaxRequest de ajax.js
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

    // Variable pour stocker le marqueur de la station active
    let currentMarker = null;

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
    // 3. REQUÊTE AJAX EN UTILISANT AJAX.JS
    // ==========================================
    function chargerDonneesIRVE() {
        // Paramètres : url, method, callback, data (null ici car pas de filtres GET)
        ajaxRequest('api-bornes.php', 'GET', function(donnees) {
            // Cette fonction anonyme est le "callback". 
            // Elle reçoit directement les données déjà parsées en JSON.
            genererTableauDynamique(donnees);
        }, null);
    }

    // ==========================================
    // 4. GÉNÉRATION DYNAMIQUE ET GESTION DU HOVER
    // ==========================================
    function genererTableauDynamique(stations) {
        tableBody.innerHTML = ""; 

        stations.forEach((station) => {
            const row = document.createElement("tr");
            
            // Stockage des attributs de données pour la station (noms calqués sur la BDD)
            row.setAttribute("data-nom_station", station.nom_station);
            row.setAttribute("data-adresse_station", station.adresse_station);
            row.setAttribute("data-nbre_pdc", station.nbre_pdc);
            row.setAttribute("data-puissance_nominale", station.puissance_nominale);
            row.setAttribute("data-coordonneesXY", station.coordonneesXY);

            row.innerHTML = `
                <td class="id-point">${station.id_point}</td>
                <td>${station.amenageur}</td>
                <td>${station.departement}</td>
                <td class="bold">${station.puissance_nominale} kW</td>
                <td>${station.connecteur}</td>
            `;

            // ÉVÉNEMENT 1 : Quand la souris entre sur la ligne (Hover IN)
            row.addEventListener("mouseenter", () => {
                const allRows = tableBody.querySelectorAll("tr");
                allRows.forEach(r => r.classList.remove("selected"));
                row.classList.add("selected");

                // Met à jour la popup noire et la position de la carte
                mettreAJourInterface(row);
            });

            // ÉVÉNEMENT 2 : Quand la souris quitte la ligne (Hover OUT)
            row.addEventListener("mouseleave", () => {
                 row.classList.remove("selected");
                 infoPopup.style.display = "none"; 
            });

            tableBody.appendChild(row);
        });
    }

    // ==========================================
    // 5. OUVERTURE POPUP ET RECENTRAGE DE LA CARTE
    // ==========================================
    function mettreAJourInterface(row) {
        const nom = row.getAttribute("data-nom_station");
        const adresse = row.getAttribute("data-adresse_station");
        const bornes = row.getAttribute("data-nbre_pdc");
        const puissance = row.getAttribute("data-puissance_nominale");
        const coordsString = row.getAttribute("data-coordonneesXY");

        // Remplissage de la popup textuelle du DOM
        popupStationName.textContent = `Station : ${nom}`;
        popupAdresse.textContent = adresse;
        popupBornes.textContent = `${bornes} bornes`;
        popupPuissance.textContent = `${puissance} kW`;

        // Affichage du bloc HTML de la popup par-dessus la carte
        infoPopup.style.display = "block";

        if (coordsString) {
            const [lat, lng] = coordsString.split(',').map(Number);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                // Force Leaflet à recalculer ses dimensions d'affichage au cas où
                map.invalidateSize();
                map.setView([lat, lng], 14);

                if (currentMarker) {
                    currentMarker.setLatLng([lat, lng]);
                } else {
                    currentMarker = L.marker([lat, lng]).addTo(map);
                }
            }
        }
    }

    // Appel au démarrage pour charger les données
    chargerDonneesIRVE();
});