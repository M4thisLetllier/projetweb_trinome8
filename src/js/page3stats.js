/**
 * IRVE DataStudio - Contrôleur Statistiques
 * FISE3 - 2026
 */

document.addEventListener("DOMContentLoaded", () => {
    const selectDep = document.getElementById("select-departement");

    // 1. REQUÊTE AJAX : Charger la liste des départements au démarrage en utilisant ajaxRequest
    ajaxRequest("../request.php/dep", "GET", function(data) {
        if (data && data.length > 0) {
            // Exemple attendu de l'API : [{num_dep: 29, denomination_dep: "Finistère"}]
            data.forEach(dep => {
                const option = document.createElement("option");
                option.value = dep.num_dep;
                option.textContent = `${dep.num_dep} - ${dep.denomination_dep}`;
                selectDep.appendChild(option);
            });
        } else {
            console.warn("Aucun département retourné par l'API.");
        }
    }, null);

    // Écouteur d'événement sur le changement de sélection du menu déroulant
    selectDep.addEventListener("change", (e) => {
        const idDep = e.target.value;
        if (idDep !== "") {
            chargerStatistiques(idDep);
        } else {
            reinitialiserInterface();
        }
    });
});

// 2. REQUÊTE AJAX : Récupérer les stats du département sélectionné
function chargerStatistiques(numDep) {
    console.log(numDep)
    // Passage du paramètre de filtrage sous forme d'objet { num_dep: numDep }
    ajaxRequest(`../request.php/dep/${numDep}`, "GET", function(data) {
        if (data) {
            // Mise à jour de l'interface avec les données filtrées de la base
            mettreAJourInterface(data);
        } else {
            console.error("Erreur : Aucune statistique renvoyée pour ce département.");
            reinitialiserInterface();
        }
    }, { num_dep: numDep }); // ajaxRequest va l'ajouter automatiquement sous la forme ?num_dep=XX
}

// Applique les valeurs récupérées dans l'arborescence HTML
function mettreAJourInterface(data) {
    // Mise à jour des cartes KPI
    document.getElementById("kpi-total-stations").textContent = data.nombre_stations || "-";
    document.getElementById("kpi-puissance-moyenne").textContent = `${data.puissance_moyenne_kw || "-"} kW`;
    document.getElementById("kpi-implantation").textContent = data.implantation_majoritaire || "-";
    document.getElementById("kpi-implantation-sub").textContent = `${data.implantation_pourcentage || "0"}% des installations globales`;
    document.getElementById("kpi-connecteur").textContent = data.prise_la_plus_utilisee || "-";

    // Récupération des pourcentages de puissance
    let total = parseInt(data.nb_rapide_plus_50kw) + parseInt(data.nb_accelere) + parseInt(data.nb_normal);
    console.log(total,data.nb_rapide_plus_50kw , data.nb_accelere ,data.nb_normal);
    const pctRapide =Math.round(data.nb_rapide_plus_50kw /total * 100 );
    const pctAccelere = Math.round(data.nb_accelere /total * 100|| 0);
    const pctNormale = Math.round(data.nb_normal /total * 100|| 0);

    // Mise à jour graphique de la barre de répartition
    document.getElementById("bar-rapide").style.width = `${pctRapide}%`;
    document.getElementById("bar-accelere").style.width = `${pctAccelere}%`;
    document.getElementById("bar-normale").style.width = `${pctNormale}%`;

    // Mise à jour des libellés textuels sous la barre
    document.getElementById("txt-rapide").textContent = `${pctRapide}%`;
    document.getElementById("txt-accelere").textContent = `${pctAccelere}%`;
    document.getElementById("txt-normale").textContent = `${pctNormale}%`;
}

// Remet l'interface à zéro si aucun département n'est sélectionné
function reinitialiserInterface() {
    document.getElementById("kpi-total-stations").textContent = "-";
    document.getElementById("kpi-puissance-moyenne").textContent = "- kW";
    document.getElementById("kpi-implantation").textContent = "-";
    document.getElementById("kpi-implantation-sub").textContent = "- % des installations globales";
    document.getElementById("kpi-connecteur").textContent = "-";
    
    document.getElementById("bar-rapide").style.width = "0%";
    document.getElementById("bar-accelere").style.width = "0%";
    document.getElementById("bar-normale").style.width = "0%";
    
    document.getElementById("txt-rapide").textContent = "- %";
    document.getElementById("txt-accelere").textContent = "- %";
    document.getElementById("txt-normale").textContent = "- %";
}