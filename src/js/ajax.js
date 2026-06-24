/**
 * Effectue une requête AJAX (XMLHttpRequest) vers l'URL indiquée.
 *
 * @param {string}   url        - URL cible de la requête
 * @param {string}   method     - Méthode HTTP : 'GET' ou 'POST'
 * @param {function} callback   - Fonction appelée avec la réponse parsée en JSON
 * @param {object}   data       - Données à envoyer (objet clé/valeur)
 */
function ajaxRequest(url, method, callback, data) {
    const xhr = new XMLHttpRequest();

    if (method.toUpperCase() === 'GET') {
        // Pour un GET on ajoute les paramètres directement dans l'URL
        const params = new URLSearchParams(data).toString();
        const fullUrl = params ? url + '?' + params : url;
        xhr.open('GET', fullUrl, true);
        xhr.send();
    } else {
        // Pour un POST on envoie les données dans le corps de la requête
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(new URLSearchParams(data).toString());
    }

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                console.log(response)
                callback(response);
            } catch (e) {
                console.error('Réponse JSON invalide :', xhr.responseText);
            }
        } else {
            console.error('Erreur HTTP :', xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error('Erreur réseau lors de la requête AJAX.');
    };
}
