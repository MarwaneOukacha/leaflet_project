var map = L.map('mapp').setView([33.9716, -6.8498], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//point 01

let vehicleProfile = 'cycling-regular';


function calculeDistance(latlang1, latlang2) {
    return (latlang1.distanceTo(latlang2) / 1000) | 0;
}

const poiData = {
    "type": "FeatureCollection",
    "features": [
        { // premier POI
            "type": "Feature",
            "properties": {
                "nom": "Musée d'Art Moderne",
                "type": "Musée"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [2.3522, 48.8566]
            }
        }, {
            "type": "Feature",
            "properties": {
                "nom": "Jardin Botanique",
                "type": "Jardin"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [2.3386, 48.8497]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "nom": "Cathédrale Notre-Dame",
                "type": "Église"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [2.3499, 48.8530]
            }
        }
    ]
}

const createCustomIcon = (iconUrl, iconSize) => {
    return L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
    });
};

const defaultIcon = createCustomIcon('marker-icon.png', [25, 41]);
const selectedIcon = createCustomIcon('marker-icon-2x.png', [60, 60]);

const poiLayer = L.geoJSON(poiData, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: defaultIcon });
    },
}).addTo(map);

// Variable pour suivre le marker sélectionné
let selectedMarker = null;
// Écoutez les changements de sélection dans la liste déroulante
const select = document.getElementById('monSelect');
select.addEventListener('change', function () {
    const selectedPoi = select.value;
    // Boucle à travers les entités GeoJSON pour trouver le POI sélectionné
    poiLayer.eachLayer(function (layer) {
        const properties = layer.feature.properties;
        const latitude = layer.feature.geometry.coordinates[1];
        const longitude = layer.feature.geometry.coordinates[0];

        if (properties.nom === selectedPoi) {
            map.setView(layer.getLatLng(), 15);
            if (selectedMarker) {
                selectedMarker.setIcon(defaultIcon);
            }

            //------------------------------------------------------------
            layer.setIcon(selectedIcon);
            selectedMarker = layer; // Mémorisez le marker sélectionné

        }

        //------------------------------------------------------------
    })
})

const openRouteServiceURL = 'https://api.openrouteservice.org/v2/directions/';
const apiKey = '5b3ce3597851110001cf6248e107735f06af48faba38570426ee8a87';
let startCoordinates = '-6.8498,33.9716';
let endCoordinates = '-7.5898,33.573';

const headers = new Headers();
headers.append('Accept', 'application/json, application/geo+json,application/gpx+xml, img/png; charset=utf-8');
const requestOptions = {
    method: 'GET',
    headers,
};
fetchData();
document.getElementById('route-form').addEventListener('submit',
    function (event) {
        event.preventDefault();
        startCoordinates = document.getElementById('start').value;
        endCoordinates = document.getElementById('end').value;
        vehicleProfile = document.getElementById('typeV').value;
        fetchData(startCoordinates, endCoordinates, vehicleProfile);
    });

function clearRoute() {
    // Code pour retirer l'itinéraire de la carte.
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
}

async function displayRoute(routeData) {
    // Code pour afficher l'itinéraire sur la carte.
    clearRoute();
    // Coordonnées de l'itinéraire.
    const coordinates = routeData.features[0].geometry.coordinates;
    // Créez un tableau d'objets de points pour afficher l'itinéraire.
    const routePoints = coordinates.map(coord => L.latLng(coord[1], coord[0]));
    // Créez une ligne (polyline) pour l'itinéraire.
    const routePolyline = L.polyline(routePoints, { color: 'blue' });
    // Ajoutez la ligne à la carte.
    routePolyline.addTo(map);
    // Ajustez la vue de la carte pour afficher l'itinéraire.
    map.fitBounds(routePolyline.getBounds());
}
async function fetchData(startCoordinates, endCoordinates, vehicleProfile) {
    try {
        const response = await fetch(
            `${openRouteServiceURL}${vehicleProfile}?api_key=${apiKey}&start=${startCoordinates}&end=${endCoordinates}&steps=true`,
            requestOptions
        );
        if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                // Accéder aux étapes (points intermédiaires)
                const steps = data.features;

                // Parcourir les étapes et les afficher dans la console par exemple
                steps.forEach(step => {
                    console.log('Étape:', step);
                    // Vous pouvez accéder aux détails de chaque étape ici, par exemple : step.properties
                });
            } else {
                console.log('Pas d\'étapes trouvées dans la réponse.');
            }
            displayRoute(data);
        } else {
            console.error('Erreur de réponse :', response.status, response.statusText);
            clearRoute();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'itinéraire :',
            error);
    }
}