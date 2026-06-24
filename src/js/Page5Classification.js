document.addEventListener("DOMContentLoaded", () => {
    // 1. Récupération des données en mémoire
    const borneDataString = sessionStorage.getItem("borneSelectionnee");
    const typeAction = sessionStorage.getItem("typePrediction");

    if (!borneDataString) {
        alert("Aucune donnée reçue. Retour à la carte.");
        window.location.href = "Page2MAP.html";
        return;
    }

    const borneSelectionnee = JSON.parse(borneDataString);

    // 2. Mise à jour du bandeau HTML
    document.getElementById("ia-id").textContent = borneSelectionnee.id_pdc_itinerance || "Inconnu";
    document.getElementById("ia-amenageur").textContent = borneSelectionnee.nom_amenageur || "Inconnu";
    document.getElementById("ia-dep").textContent = borneSelectionnee.denomination_dep || "Inconnu";
    document.getElementById("ia-puissance").textContent = borneSelectionnee.puissance_nominale || "0";

    // 3. Envoi au PHP
    const formData = new FormData();
    for (const cle in borneSelectionnee) {
        formData.append(cle, borneSelectionnee[cle]);
    }
    formData.append("action_ia", typeAction);
    console.log("Données envoyées à l'IA :",formData);

    fetch('../api_ia.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Victoire ! L'IA a répondu :", data);

        if (data.erreur) {
            alert("Erreur IA : " + data.erreur);
        } else {
            // Mise à jour de l'UI selon l'action
            if (typeAction === "btn-predire-implantation") {
                // On met à jour le premier bloc
                document.getElementById("resultat-rf-imp").textContent = "Résultat : " + data.prediction_IA;
                document.getElementById("barre-rf-imp").style.width = "94.2%";
            } 
            else if (typeAction === "btn-predire-puissance") {
                // On met à jour le deuxième bloc
                document.getElementById("resultat-knn-pui").textContent = "Valeur estimée : " + data.prediction_IA;
                document.getElementById("barre-knn-pui").style.width = "91.0%";
            }
        }
    })
    .catch(error => {
        console.error("Erreur :", error);
        alert("Erreur de connexion avec le serveur.");
    });
});