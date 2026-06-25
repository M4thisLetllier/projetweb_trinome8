/**
 * Page5Classification.js - Appel IA simultané pour Implantation et Puissance
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Récupération des données de la borne cliquée sur la Page 2
    const borneDataString = sessionStorage.getItem("borneSelectionnee");

    if (!borneDataString) {
        alert("Aucune donnée trouvée. Retour à la carte.");
        window.location.href = "Page2MAP.html";
        return;
    }

    const borneSelectionnee = JSON.parse(borneDataString);

    // 2. Mise à jour de la bannière verte en haut
    document.getElementById("ia-id").textContent = borneSelectionnee.id_pdc_itinerance || "Inconnu";
    document.getElementById("ia-amenageur").textContent = borneSelectionnee.nom_amenageur || "Inconnu";
    document.getElementById("ia-dep").textContent = borneSelectionnee.denomination_dep || "Inconnu";
    document.getElementById("ia-puissance").textContent = (borneSelectionnee.puissance_nominale || "0") + " kW";

    const puissanceReelle = parseFloat(borneSelectionnee.puissance_nominale) || 0;

    // 3. Fonction générique pour interroger le script PHP/Python
    function demanderPredictionIA(action) {
        const formData = new FormData();
        for (const cle in borneSelectionnee) {
            formData.append(cle, borneSelectionnee[cle]);
        }
        formData.append("action_ia", action);

        return fetch('../api_ia.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }

    // 4. Lancer la prédiction pour L'IMPLANTATION (Carte de gauche)
    demanderPredictionIA("btn-predire-implantation")
        .then(data => {
            if (data.erreur) {
                console.error("Erreur IA Implantation:", data.erreur);
                document.getElementById("pred-rf-imp").textContent = "Erreur IA";
                return;
            }
            // Remplissage des données trouvées et prédites
            document.getElementById("pred-rf-imp").textContent = data.prediction_IA;
            document.getElementById("reel-rf-imp").textContent = borneSelectionnee.denomination_implantation || "Non renseigné";
            document.getElementById("barre-rf-imp").style.width = "94.2%";
        })
        .catch(error => console.error("Erreur réseau Implantation:", error));

    // 5. Lancer la prédiction pour LA PUISSANCE (Carte de droite)
    demanderPredictionIA("btn-predire-puissance")
        .then(data => {
            if (data.erreur) {
                console.error("Erreur IA Puissance:", data.erreur);
                document.getElementById("pred-knn-pui").textContent = "Erreur IA";
                return;
            }
            
            const puissancePredite = parseFloat(data.prediction_IA) || 0;
            
            // Remplissage des données trouvées et prédites
            document.getElementById("pred-knn-pui").textContent = puissancePredite.toFixed(2) + " kW";
            document.getElementById("reel-knn-pui").textContent = puissanceReelle + " kW";
            document.getElementById("barre-knn-pui").style.width = "91.0%";

            // Calcul du pourcentage d'erreur (la formule mathématique)
            if (puissanceReelle > 0) {
                const erreur = (Math.abs(puissanceReelle - puissancePredite) / puissanceReelle) * 100;
                document.getElementById("err-knn-pui").textContent = erreur.toFixed(2) + " %";
                
                // Mettre l'erreur en rouge pour que ça ressorte bien
                document.getElementById("err-knn-pui").style.color = "red";
            } else {
                document.getElementById("err-knn-pui").textContent = "N/A";
            }
        })
        .catch(error => console.error("Erreur réseau Puissance:", error));
});