/**
 * IRVE DataStudio - Contrôleur JavaScript Principal
 * FISE3 - 2026
 */
document.addEventListener("DOMContentLoaded", () => {
    let stationSelectionnee = null;
    let toutesLesBornes = [];

    // ==========================================
    // 1. INITIALISATION DE LA CARTE (Leaflet)
    // ==========================================
    const map = L.map('map').setView([46.2276, 2.2137], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    // ==========================================
    // 2. SÉLECTION DES ÉLÉMENTS DU DOM
    // ==========================================
    const tableBody = document.getElementById("table-body");
    const infoPopup = document.getElementById("info-popup");
    const popupStationName = document.getElementById("popup-station-name");
    const popupAdresse = document.getElementById("popup-adresse");
    const popupBornes = document.getElementById("popup-bornes");
    const popupPuissance = document.getElementById("popup-puissance");
    
    const btnImplantation = document.getElementById("btn-predire-implantation");
    const btnPuissance = document.getElementById("btn-predire-puissance");

    // ==========================================
    // 3. REQUÊTES AJAX
    // ==========================================
    function initialiserCarteEtBornes() {
        ajaxRequest('../request.php/pdc', 'GET', function(donnees) {
            if (donnees && donnees.length > 0 && !donnees.error) {
                toutesLesBornes = donnees;
                afficherTousLesMarqueurs(toutesLesBornes);
                mettreAJourTableauFiltre();
            }
        }, {}); 
    }

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
                const lesDixPremieres = bornesVisibles.slice(0, 10);
                genererTableauDynamique(lesDixPremieres);
            }
        }, {});
    }

    // ==========================================
    // 4. FONCTIONS DE RENDU VISUEL
    // ==========================================
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
            
            if (stationSelectionnee && stationSelectionnee.id_pdc_itinerance === station.id_pdc_itinerance) {
                radio.checked = true;
                row.classList.add("selected-fixe");
            }

            radio.addEventListener("change", () => {
                stationSelectionnee = station;
                const allRows = tableBody.querySelectorAll("tr");
                allRows.forEach(r => r.classList.remove("selected-fixe"));
                row.classList.add("selected-fixe");
            });

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

    function afficherInfosPopup(donneesStation) {
        popupStationName.textContent = `Commune : ${donneesStation.nom_commune || '--'}`;
        popupAdresse.textContent = `Prise : ${donneesStation.denomination_prise || '--'}`;
        popupBornes.textContent = `Paiement : ${donneesStation.denomination_paiment || '--'}`;
        popupPuissance.textContent = `${donneesStation.puissance_nominale || '--'} kW`;
        infoPopup.style.display = "block";
    }

    // ==========================================
    // 5. ÉCOUTEURS D'ÉVÉNEMENTS CARTE & BOUTONS
    // ==========================================
    map.on('moveend', mettreAJourTableauFiltre);

    function lancerPrediction(e) {
        e.preventDefault(); 
        
        if (!stationSelectionnee) {
            alert("Veuillez sélectionner une borne de recharge à l'aide des boutons radio !");
            return;
        }

        // Sauvegarde des données dans le navigateur
        sessionStorage.setItem("borneSelectionnee", JSON.stringify(stationSelectionnee));
        sessionStorage.setItem("typePrediction", this.id); 

        // Redirection
        window.location.href = "Page5Classification.html";
    }

    if (btnImplantation) btnImplantation.addEventListener("click", lancerPrediction);
    if (btnPuissance) btnPuissance.addEventListener("click", lancerPrediction);

    initialiserCarteEtBornes();
});