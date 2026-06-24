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
    // 3. REQUÊTES AJAX SANS PARAMÈTRES ?action= (FORMAT PATH INFO)
    // ==========================================
    
    // Étape A : Charger TOUTES les bornes au démarrage pour garnir la CARTE
    function initialiserCarteEtBornes() {
        // Ciblage de la ressource globale /pdc sans aucun attribut de données
        ajaxRequest('../request.php/pdc', 'GET', function(donnees) {
            if (donnees && donnees.length > 0 && !donnees.error) {
                toutesLesBornes = donnees;
                afficherTousLesMarqueurs(toutesLesBornes);
                
                // Une fois la carte dessinée, on lance le premier filtrage du tableau
                mettreAJourTableauFiltre();
            }
        }, {}); 
    }

    // Étape B : Demander au serveur uniquement 10 bornes pour le TABLEAU
   // Étape B : Demander au serveur les bornes de la zone, garnir la carte et limiter le tableau à 10
    // Étape B : Charger les données via la route globale 'pdc' et filtrer en JavaScript
    function mettreAJourTableauFiltre() {
        // 1. On récupère les limites géométriques actuelles de la carte (la boîte visible)
        const limites = map.getBounds();

        // 2. On appelle la ressource 'pdc' (qui contient toutes tes variables Aménageur, Prises, etc.)
        ajaxRequest('../request.php/pdc', 'GET', function(toutesLesBornesDuReseau) {
            if (toutesLesBornesDuReseau && !toutesLesBornesDuReseau.error) {
                
                // 3. Filtrage en JavaScript : on ne garde que les bornes situées dans la zone visible à l'écran
                const bornesVisibles = toutesLesBornesDuReseau.filter(station => {
                    if (!station.latitude_pdc || !station.longitude_pdc) return false;
                    
                    const lat = parseFloat(station.latitude_pdc);
                    const lng = parseFloat(station.longitude_pdc);
                    
                    // On vérifie si les coordonnées de la borne sont à l'intérieur des limites de la carte
                    return limites.contains([lat, lng]);
                });

                // 4. On rafraîchit les marqueurs de la carte avec les bornes de cette zone
                afficherTousLesMarqueurs(bornesVisibles);

                // 5. On extrait uniquement les 10 premières lignes pour ton tableau de gauche
                const lesDixPremieres = bornesVisibles.slice(0, 10);
                
                // 6. On génère le tableau (les variables textuelles seront présentes grâce à la route pdc)
                genererTableauDynamique(lesDixPremieres);
            }
        }, {}); // Pas besoin de passer de paramètres d'URL, le filtrage se fait côté client
    }
    // ==========================================
    // 4. FONCTIONS DE RENDU VISUEL
    // ==========================================
    
    // Met le maximum de points sur la carte (Lancée 1 seule fois)
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

    // Met à jour les 10 lignes du tableau de gauche
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
    
    // Dès que le zoom change ou qu'on bouge, le tableau suit
    map.on('moveend', mettreAJourTableauFiltre);

    function lancerPrediction(e) {
        e.preventDefault(); 
        if (!stationSelectionnee) {
            alert("Veuillez sélectionner une borne de recharge à l'aide des boutons radio !");
            return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "Page5Classification.html"; 

        for (const key in stationSelectionnee) {
            if (stationSelectionnee.hasOwnProperty(key)) {
                const hiddenField = document.createElement("input");
                hiddenField.type = "hidden";
                hiddenField.name = key;
                hiddenField.value = stationSelectionnee[key];
                form.appendChild(hiddenField);
            }
        }

        const typePrediction = document.createElement("input");
        typePrediction.type = "hidden";
        typePrediction.name = "bouton_clique";
        typePrediction.value = this.id; 
        form.appendChild(typePrediction);

        document.body.appendChild(form);
        form.submit();
    }

    if (btnImplantation) btnImplantation.addEventListener("click", lancerPrediction);
    if (btnPuissance) btnPuissance.addEventListener("click", lancerPrediction);

    // Démarrage initial
    initialiserCarteEtBornes();
});