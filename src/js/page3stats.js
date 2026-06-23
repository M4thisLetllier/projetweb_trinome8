

document.addEventListener("DOMContentLoaded", () => {
    const selectDep = document.getElementById("select-departement");

    // 1. REQUÊTE AJAX : Charger la liste des départements au démarrage
    fetch("api-departements.php")
        .then(response => {
            if (!response.ok) throw new Error("Erreur réseau");
            return response.json();
        })
        .then(data => {
            // Exemple attendu de l'API : [{num_dep: 29, denomination_dep: "Finistère"}]
            data.forEach(dep => {
                const option = document.createElement("option");
                option.value = dep.num_dep;
                option.textContent = `${dep.num_dep} - ${dep.denomination_dep}`;
                selectDep.appendChild(option);
            });
        })
        .catch(error => console.error("Impossible de charger les départements:", error));

    // Écouteur d'événement sur le changement de sélection
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
    // On envoie le numéro du département en paramètre GET à ton API PHP
    fetch(`api-stats.php?num_dep=${numDep}`)
        .then(response => {
            if (!response.ok) throw new Error("Erreur lors de la récupération des données");
            return response.json();
        })
        .then(data => {
            // Mettre à jour l'interface HTML avec les données reçues de ta base
            mettreAJourInterface(data);
        })
        .catch(error => {
            console.error("Erreur AJAX :", error);
            reinitialiserInterface();
        });
}

// Applique les valeurs récupérées dans l'arborescence HTML
function mettreAJourInterface(data) {
    // Mise à jour des cartes KPI
    document.getElementById("kpi-total-stations").textContent = data.total_stations || "-";
    document.getElementById("kpi-puissance-moyenne").textContent = `${data.puissance_moyenne || "-"} kW`;
    document.getElementById("kpi-implantation").textContent = data.implantation_majoritaire || "-";
    document.getElementById("kpi-implantation-sub").textContent = `${data.implantation_pourcentage || "0"}% des installations globales`;
    document.getElementById("kpi-connecteur").textContent = data.connecteur_standard || "-";

    // Récupération des pourcentages de puissance
    const pctRapide = data.pct_rapide || 0;
    const pctAccelere = data.pct_accelere || 0;
    const pctNormale = data.pct_normale || 0;

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