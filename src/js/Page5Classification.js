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
    // Conversion de la chaîne JSON en objet JavaScript
    const borneSelectionnee = JSON.parse(borneDataString);

    // 2. Mise à jour de la bannière verte en haut
    document.getElementById("ia-id").textContent = borneSelectionnee.id_pdc_itinerance || "Inconnu";
    document.getElementById("ia-amenageur").textContent = borneSelectionnee.nom_amenageur || "Inconnu";
    document.getElementById("ia-dep").textContent = borneSelectionnee.denomination_dep || "Inconnu";
    document.getElementById("ia-puissance").textContent = (borneSelectionnee.puissance_nominale || "0") + " kW";

    // Conversion de la puissance nominale en nombre pour le calcul d'erreur
    const puissanceReelle = parseFloat(borneSelectionnee.puissance_nominale) || 0;

    // 3. Fonction générique pour interroger le script PHP/Python
    function demanderPredictionIA(action) {
        const formData = new FormData();
        for (const cle in borneSelectionnee) { // Ajout de toutes les données de la borne sélectionnée
            formData.append(cle, borneSelectionnee[cle]); // Ajoute chaque propriété de l'objet borneSelectionnee au FormData
        }
        formData.append("action_ia", action); // Ajout de l'action spécifique pour l'IA (implantation ou puissance)

        return fetch('../api_ia.php', {
            method: 'POST', // Utilisation de POST pour envoyer les données
            body: formData
        }).then(response => response.json());
    }

    // 4. Lancer la prédiction pour L'IMPLANTATION (Carte de gauche)
    demanderPredictionIA("btn-predire-implantation") 
        .then(data => {
             // Gestion de la réponse de l'IA pour l'implantation
            if (data.erreur) { 
                // Vérification si l'IA a renvoyé une erreur
                console.error("Erreur IA Implantation:", data.erreur);
                document.getElementById("pred-rf-imp").textContent = "Erreur IA"; 
                return;
            }
            // Remplissage des données trouvées et prédites
            document.getElementById("pred-rf-imp").textContent = data.prediction_IA; // Affichage de la prédiction de l'IA pour l'implantation
            document.getElementById("reel-rf-imp").textContent = borneSelectionnee.denomination_implantation || "Non renseigné";
            document.getElementById("barre-rf-imp").style.width = "94.2%";
        })
        // Gestion des erreurs réseau pour l'implantation
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
            document.getElementById("pred-knn-pui").textContent = puissancePredite.toFixed(2) + " kW"; // Affichage de la prédiction de l'IA pour la puissance
            document.getElementById("reel-knn-pui").textContent = puissanceReelle + " kW"; // Affichage de la puissance réelle de la borne
            document.getElementById("barre-knn-pui").style.width = "91.0%";

            // Calcul du pourcentage d'erreur (la formule mathématique)
            if (puissanceReelle > 0) {
                const erreur = (Math.abs(puissanceReelle - puissancePredite) / puissanceReelle) * 100;
                document.getElementById("err-knn-pui").textContent = erreur.toFixed(2) + " %";
                
                // Mettre l'erreur en rouge pour que ça ressorte bien
                document.getElementById("err-knn-pui").style.color = "red"; // Changement de couleur du texte de l'erreur en rouge
            } else {
                document.getElementById("err-knn-pui").textContent = "N/A"; // Si la puissance réelle est 0, on ne peut pas calculer l'erreur
            }
        })
        // Gestion des erreurs réseau pour la puissance
        .catch(error => console.error("Erreur réseau Puissance:", error));
});