/**
 * IRVE DataStudio - Contrôleur JavaScript Principal
 * FISE3 - 2026
 */

document.addEventListener("DOMContentLoaded", () => {
    // Variable pour stocker la station actuellement sélectionnée par le bouton radio
    let stationSelectionnee = null;

    // ==========================================
    // 1. INITIALISATION DE LA CARTE (Leaflet)
    // ==========================================
    const map = L.map('map').setView([46.2276, 2.2137], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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
    
    // Les deux boutons d'action
    const btnImplantation = document.getElementById("btn-predire-implantation");
    const btnPuissance = document.getElementById("btn-predire-puissance");

    // ==========================================
    // 3. REQUÊTE AJAX
    // ==========================================
    function chargerDonneesIRVE() {
        // La requête part vers le Contrôleur/Modèle PHP configuré par ton collègue
        ajaxRequest('../request.php/pdc', 'GET', function(donnees) {
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
        markersGroup.clearLayers(); 

        stations.forEach((station) => {
            // --- A. RENDU DU TABLEAU DE GAUCHE ---
            const row = document.createElement("tr");
            
            // Ajout du bouton radio dans la première cellule <td>
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

            // Écouteur sur le bouton radio pour sauvegarder la sélection
            const radio = row.querySelector(".radio-borne");
            radio.addEventListener("change", () => {
                stationSelectionnee = station;
                
                // Effet visuel persistant sur la ligne sélectionnée
                const allRows = tableBody.querySelectorAll("tr");
                allRows.forEach(r => r.classList.remove("selected-fixe"));
                row.classList.add("selected-fixe");
            });

            // Événement Hover classique (survol de la souris)
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

                    marker.on('mouseover', () => { afficherInfosPopup(station); });
                    marker.on('mouseout', () => { infoPopup.style.display = "none"; });

                    markersGroup.addLayer(marker);
                }
            }
        });

        map.invalidateSize();
    }

    function afficherInfosPopup(donneesStation) {
        popupStationName.textContent = `Commune : ${donneesStation.nom_commune || '--'}`;
        popupAdresse.textContent = `Prise : ${donneesStation.denomination_prise || '--'}`;
        popupBornes.textContent = `Paiement : ${donneesStation.denomination_paiment || '--'}`;
        popupPuissance.textContent = `${donneesStation.puissance_nominale || '--'} kW`;
        infoPopup.style.display = "block";
    }

    // ==========================================
    // 5. GESTION DE L'ENVOI POST AU CLIC SUR LES BOUTONS
    // ==========================================
    function lancerPrediction(event) {
        event.preventDefault(); // Empêche le bouton de recharger la page dans le vide
        
        if (!stationSelectionnee) {
            alert("Veuillez sélectionner une borne de recharge à l'aide des boutons radio avant de lancer la prédiction !");
            return;
        }

        // Création du formulaire virtuel caché
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "Page5Classification.html"; // Redirection vers ta belle interface !

        // Insertion de toutes les données de la station dans la valise
        for (const key in stationSelectionnee) {
            if (stationSelectionnee.hasOwnProperty(key)) {
                const hiddenField = document.createElement("input");
                hiddenField.type = "hidden";
                hiddenField.name = key;
                hiddenField.value = stationSelectionnee[key];
                form.appendChild(hiddenField);
            }
        }

        // Ajout de l'indicateur du bouton cliqué pour le PHP
        const typePrediction = document.createElement("input");
        typePrediction.type = "hidden";
        typePrediction.name = "bouton_clique";
        typePrediction.value = this.id; 
        form.appendChild(typePrediction);

        // Envoi final
        document.body.appendChild(form);
        form.submit();
    }

    // On attache la fonction aux deux boutons verts de la page
    if (btnImplantation) {
        btnImplantation.addEventListener("click", lancerPrediction);
    }
    if (btnPuissance) {
        btnPuissance.addEventListener("click", lancerPrediction);
    }

    // Lancement de la récupération des données au chargement de la page
    chargerDonneesIRVE();
});