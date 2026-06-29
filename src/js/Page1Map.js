document.addEventListener("DOMContentLoaded", () => {
    // Variable qui stocke temporairement la ligne cliquée par l'utilisateur
    let stationSelectionnee = null;
    let toutesLesBornes = [];

    // Initialisation de la carte Leaflet centrée sur la France
    const map = L.map('map').setView([46.2276, 2.2137], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    // Liaisons avec le HTML
    const tableBody = document.getElementById("table-body");
    const infoPopup = document.getElementById("info-popup");
    const popupStationName = document.getElementById("popup-station-name");
    const popupAdresse = document.getElementById("popup-adresse");
    const popupBornes = document.getElementById("popup-bornes");
    const popupPuissance = document.getElementById("popup-puissance");
    
    const btnPredictionIA = document.getElementById("btn-prediction-ia");

    // Appel au backend (PHP) pour récupérer les données en base
    function initialiserCarteEtBornes() {
        ajaxRequest('../request.php/pdc', 'GET', function(donnees) {
            if (donnees && donnees.length > 0 && !donnees.error) {
                toutesLesBornes = donnees;
                afficherTousLesMarqueurs(toutesLesBornes);
                mettreAJourTableauFiltre();
            }
        }, {}); 
    }

    // Optimisation : Ne charge dans le tableau que les bornes visibles à l'écran
    function mettreAJourTableauFiltre() {
        const limites = map.getBounds();
        ajaxRequest('../request.php/pdc', 'GET', function(toutesLesBornesDuReseau) {
            if (toutesLesBornesDuReseau && !toutesLesBornesDuReseau.error) {
                const bornesVisibles = toutesLesBornesDuReseau.filter(station => {
                    if (!station.latitude_pdc || !station.longitude_pdc) return false;
                    const lat = parseFloat(station.latitude_pdc);
                    const lng = parseFloat(station.longitude_pdc);
                    return limites.contains([lat, lng]);
                });
                
                afficherTousLesMarqueurs(bornesVisibles);
                
                // On limite l'affichage à 10 pour éviter de surcharger le navigateur
                const lesDixPremieres = bornesVisibles.slice(0, 10);
                genererTableauDynamique(lesDixPremieres);
            }
        }, {});
    }

    // Place les points géographiques sur la carte
    function afficherTousLesMarqueurs(stations) {
        markersGroup.clearLayers();
        stations.forEach((station) => {
            if (station.latitude_pdc && station.longitude_pdc) {
                const lat = Number(station.latitude_pdc);
                const lng = Number(station.longitude_pdc);

                if (!isNaN(lat) && !isNaN(lng)) {
                    const marker = L.marker([lat, lng]);
                    marker.on('mouseover', () => { afficherInfosPopup(station); });
                    marker.on('mouseout', () => { infoPopup.style.display = "none"; });
                    markersGroup.addLayer(marker);
                }
            }
        });
    }

    // Construction dynamique du tableau à partir des données SQL
    function genererTableauDynamique(stationsVisibles) {
        tableBody.innerHTML = ""; 

        stationsVisibles.forEach((station) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <input type="radio" name="select-borne" class="radio-borne" value="${station.id_pdc_itinerance || ''}">
                </td>
                <td class="id-point">${station.id_pdc_itinerance || '--'}</td>
                <td>${station.nom_amenageur || '--'}</td>
                <td>${station.denomination_dep || '--'}</td>
                <td class="bold">${station.puissance_nominale || '--'} kW</td>
                <td>${station.denomination_prise || '--'}</td>
                <td>${station.denomination_paiment || '--'}</td>
            `;

            const radio = row.querySelector(".radio-borne");
            
            // Maintien de la sélection visuelle lors d'un zoom/déplacement
            if (stationSelectionnee && stationSelectionnee.id_pdc_itinerance === station.id_pdc_itinerance) {
                radio.checked = true;
                row.classList.add("selected-fixe");
            }

            // Enregistre la ligne cliquée par l'utilisateur
            radio.addEventListener("change", () => {
                stationSelectionnee = station;
                const allRows = tableBody.querySelectorAll("tr");
                allRows.forEach(r => r.classList.remove("selected-fixe"));
                row.classList.add("selected-fixe");
            });

            // Effets de survol (hover) liés à la carte
            row.addEventListener("mouseenter", () => {
                row.classList.add("selected");
                afficherInfosPopup(station);
            });

            row.addEventListener("mouseleave", () => {
                 row.classList.remove("selected");
                 infoPopup.style.display = "none"; 
            });

            tableBody.appendChild(row);
        });
    }

    // Remplit la petite bulle d'information sur la carte
    function afficherInfosPopup(donneesStation) {
        popupStationName.textContent = `Commune : ${donneesStation.nom_commune || '--'}`;
        popupAdresse.textContent = `Prise : ${donneesStation.denomination_prise || '--'}`;
        popupBornes.textContent = `Paiement : ${donneesStation.denomination_paiment || '--'}`;
        popupPuissance.textContent = `${donneesStation.puissance_nominale || '--'} kW`;
        infoPopup.style.display = "block";
    }

    // Recharge le tableau à chaque fois que l'utilisateur déplace la carte
    map.on('moveend', mettreAJourTableauFiltre);

    // Sécurité : Vérifie qu'une borne est choisie avant d'envoyer à l'IA
    if (btnPredictionIA) {
        btnPredictionIA.addEventListener("click", function(e) {
            e.preventDefault(); 
            
            if (!stationSelectionnee) {
                alert("Veuillez d'abord sélectionner une borne dans le tableau.");
                return ; 
            }

            // On stocke la borne en cache navigateur pour la récupérer sur la Page 5
            sessionStorage.setItem("borneSelectionnee", JSON.stringify(stationSelectionnee));// Redirection vers le dashboard IA

            // Redirection vers le dashboard IA
            window.location.href = "Page5Classification.html";
        });
    }

    initialiserCarteEtBornes();
});