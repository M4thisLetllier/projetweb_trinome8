/**
 * Page5Classification.js - Réception, appel IA et calcul des erreurs
 */
document.addEventListener("DOMContentLoaded", () => {
    const borneDataString = sessionStorage.getItem("borneSelectionnee");
    const typeAction = sessionStorage.getItem("typePrediction");

    if (!borneDataString) {
        alert("Aucune donnée trouvée. Retour à la carte.");
        window.location.href = "Page2MAP.html";
        return;
    }

    const borneSelectionnee = JSON.parse(borneDataString);

    // Mise à jour de la bannière
    document.getElementById("ia-id").textContent = borneSelectionnee.id_pdc_itinerance || "Inconnu";
    document.getElementById("ia-amenageur").textContent = borneSelectionnee.nom_amenageur || "Inconnu";
    document.getElementById("ia-dep").textContent = borneSelectionnee.denomination_dep || "Inconnu";
    document.getElementById("ia-puissance").textContent = borneSelectionnee.puissance_nominale || "0";

    // Préparation des données pour l'IA
    const formData = new FormData();
    for (const cle in borneSelectionnee) {
        formData.append(cle, borneSelectionnee[cle]);
    }
    formData.append("action_ia", typeAction);

    fetch('../api_ia.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.erreur) {
            alert("Erreur IA : " + data.erreur);
            return;
        }

        // On récupère la puissance réelle depuis les données de la borne
        const puissanceReelle = parseFloat(borneSelectionnee.puissance_nominale) || 0;
        
        if (typeAction === "btn-predire-implantation") {
            // --- ACTION : PRÉDIRE L'IMPLANTATION ---
            document.getElementById("pred-rf-imp").textContent = data.prediction_IA;
            // Si tu as une variable spécifique pour l'implantation dans ta DB, remplace "Inconnue" par cette variable (ex: borneSelectionnee.type_implantation)
            document.getElementById("reel-rf-imp").textContent = "Inconnue"; 
            document.getElementById("barre-rf-imp").style.width = "94.2%";
            
        } else if (typeAction === "btn-predire-puissance") {
            // --- ACTION : PRÉDIRE LA PUISSANCE ---
            const puissancePredite = parseFloat(data.prediction_IA) || 0;
            
            document.getElementById("pred-knn-pui").textContent = puissancePredite.toFixed(2) + " kW";
            document.getElementById("reel-knn-pui").textContent = puissanceReelle + " kW";
            document.getElementById("barre-knn-pui").style.width = "91.0%";

            // Calcul du pourcentage d'erreur : |vraie - prédite| / vraie * 100
            if (puissanceReelle > 0) {
                const erreur = Math.abs(puissanceReelle - puissancePredite) / puissanceReelle * 100;
                document.getElementById("err-knn-pui").textContent = erreur.toFixed(2) + " %";
            } else {
                document.getElementById("err-knn-pui").textContent = "N/A";
            }
        }
    })
    .catch(error => {
        console.error("Erreur Fetch:", error);
        alert("Erreur de connexion avec le serveur PHP.");
    });
});