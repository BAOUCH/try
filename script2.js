let villageData = {};
let pieChart;

// Fonction pour introduire un délai
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureLayersRendered() {
    await delay(500); // 500 ms pour permettre aux couches d'être rendues
}

// Charger le fichier GeoJSON et préparer les données pour le graphique
fetch('surface.geojson')
    .then(response => response.json())
    .then(data => {
        data.features.forEach(feature => {
            const village = feature.properties.name;
            const surfaceTotale = feature.properties.surface_T;
            const surfaceDetruite = feature.properties.surface;
            const surfaceNonDetruite = surfaceTotale - surfaceDetruite;

            // Stocker les informations pour chaque village
            villageData[village] = {
                detruite: surfaceDetruite,
                nonDetruite: surfaceNonDetruite
            };
        });
        console.log("Contenu de villageData :", villageData);
    });

// Mettre à jour le diagramme circulaire
function updatePieChart(village) {
    const data = villageData[village];
    const chartData = {
        labels: ['Détruit', 'Non détruit'],
        datasets: [{
            data: [data.detruite, data.nonDetruite],
            backgroundColor: ['#FF6384', '#36A2EB'],
        }]
    };

    if (pieChart) {
        pieChart.destroy(); // Supprimer l'ancien graphique pour éviter les doublons
    }

    pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: village
                },
                subtitle: {
                    display: true,
                    text: 'La surface des bâtiments détruits et non détruits'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialiser la carte Leaflet
var map = L.map('map', {
    center: [31.0245, -8.1356],
    zoom: 10,
    dragging: false,
    
    keyboard: false
});

// Ajouter la couche de base
var stamenLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.carto.com/attributions">CARTO</a>'
}).addTo(map);

// Précharger toutes les couches raster
let layer1, layer2, layer3, layer4, layer5, layer6;
let sideBySideControl;

function loadAllGeoRasters() {
    console.time("fetch")
    const result = Promise.all([
        loadGeoRaster(rasterUrls.village1[0]).then(layer => layer1 = layer),
        loadGeoRaster(rasterUrls.village1[1]).then(layer => layer2 = layer),
        loadGeoRaster(rasterUrls.village2[0]).then(layer => layer3 = layer),
        loadGeoRaster(rasterUrls.village2[1]).then(layer => layer4 = layer),
        loadGeoRaster(rasterUrls.village3[0]).then(layer => layer5 = layer),
        loadGeoRaster(rasterUrls.village3[1]).then(layer => layer6 = layer)
    ]);
    console.timeEnd("fetch")

    return result
}

function loadGeoRaster(url) {
    return parseGeoraster(url)
        .then(georaster => new GeoRasterLayer({
            georaster: georaster,
            resolution: 250, // Ajuster la résolution selon le besoin
        }));
}

// URLs des rasters
const rasterUrls = {
    village1: [
        'https://webmap-storage.s3.us-east-1.amazonaws.com/10300500E4F91800visual11COG.TIF',
        'https://webmap-storage.s3.us-east-1.amazonaws.com/103001008244DA00-visual21COG.TIF'
    ],
    village2: [
        'https://webmap-storage.s3.us-east-1.amazonaws.com/10300500E4F91800visual12COG.TIF',
        'https://webmap-storage.s3.us-east-1.amazonaws.com/103001008244DA00-visual22COG.TIF'
    ],
    village3: [
        'https://webmap-storage.s3.us-east-1.amazonaws.com/10300500E4F91800visual13COG.TIF',
        'https://webmap-storage.s3.us-east-1.amazonaws.com/103001008244DA00visual23COG.TIF'
    ]
};

// Fonction pour afficher les couches d'un village
function showLayers(layerA, layerB, village) {
    // Supprimer les couches précédentes
   

    // Ajouter les nouvelles couches
    layerA.addTo(map);
    layerB.addTo(map);

    // Ajuster les contrôles et les limites
    if (sideBySideControl) map.removeControl(sideBySideControl);
    map.fitBounds(layerA.getBounds());
    sideBySideControl = L.control.sideBySide(layerA, layerB).addTo(map);
    ensureLayersRendered()
    // Mettre à jour le graphique
    updatePieChart(village);
}

// Charger toutes les couches au chargement de la page
loadAllGeoRasters().then(() => {
    console.log("Toutes les couches sont chargées");
    // Afficher les couches du premier village par défaut
    showLayers(layer1, layer2, 'village1');
});

// Associer les boutons aux couches préchargées
document.getElementById('village1').addEventListener('click', () => {
    showLayers(layer1, layer2, 'village1');
});

document.getElementById('village2').addEventListener('click', () => {
    showLayers(layer3, layer4, 'village2');
});

document.getElementById('village3').addEventListener('click', () => {
    showLayers(layer5, layer6, 'village3');
});
