

let villageData = {};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
async function ensureLayersRendered() {
    // Vérifie le rendu des couches après un court délai
    await delay(700); // 500 ms pour donner le temps de rendre les couches
  }


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
  })

  let pieChart;

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
          pieChart.destroy();  // Supprimer l'ancien graphique pour éviter les doublons
      }
  
      pieChart = new Chart(document.getElementById('pieChart'), {
          type: 'pie',
          
          data: chartData,
          options: {
              responsive: true,
              plugins: {
                    title:{
                        display: true,
                        text:village},
                    subtitle: {
                            display: true,
                            text: 'La surface des batiments detruits et non detruits'
                        },
                    legend: {
                      position: 'bottom'
                    },
                    

                  }
              }
      })
    };

var map = L.map('map', {
  center: [31.0245, -8.1356],
  zoom: 10,
  dragging: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false
});

// Ajouter la couche de base
var stamenLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.carto.com/attributions">CARTO</a>'
}).addTo(map);

let layer1, layer2, layer3, layer4 , layer5, layer6;
let sideBySideControl;

function loadGeoRaster(url) {
    return fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => parseGeoraster(arrayBuffer))
      .then(georaster => new GeoRasterLayer({
        georaster: georaster,
        resolution: 256,
      }));
  }






  function showFirstLayerSet() {
    Promise.all([
      loadGeoRaster('10300500E4F91800visual11.tif'),
      loadGeoRaster('103001008244DA00-visual21.tif')
    ]).then(async ([layerA, layerB]) => {
      if (layer3 && layer4) {
        map.removeLayer(layer3);
        map.removeLayer(layer4);
      }
      if (layer5 && layer6) {
        map.removeLayer(layer5);
        map.removeLayer(layer6);
      }
  
      layer1 = layerA;
      layer2 = layerB;
      layer1.addTo(map);
      layer2.addTo(map);
      if (sideBySideControl) map.removeControl(sideBySideControl);
      map.fitBounds(layer1.getBounds());
      sideBySideControl = L.control.sideBySide(layer1, layer2).addTo(map);
  
      // Attendre que les couches soient rendues
      await ensureLayersRendered();
  
      // Affichez le pie chart après le rendu complet des images
      updatePieChart('village1');
    });
  }
  
  function showSecondLayerSet() {
    Promise.all([
      loadGeoRaster('10300500E4F91800visual12.tif'),
      loadGeoRaster('103001008244DA00-visual22.tif')
    ]).then(async ([layerC, layerD]) => {
      if (layer1 && layer2) {
        map.removeLayer(layer1);
        map.removeLayer(layer2);
      }

      if (layer5 && layer6) {
        map.removeLayer(layer5);
        map.removeLayer(layer6);
      }
  
      layer3 = layerC;
      layer4 = layerD;
      layer3.addTo(map);
      layer4.addTo(map);
      if (sideBySideControl) map.removeControl(sideBySideControl);
      map.fitBounds(layer3.getBounds());
      sideBySideControl = L.control.sideBySide(layer3, layer4).addTo(map);
  
      // Attendre que les couches soient rendues
      await ensureLayersRendered();
  
      // Affichez le pie chart après le rendu complet des images
      updatePieChart('village2');
    });
  }


  function showThirdLayerSet() {
    Promise.all([
      loadGeoRaster('cog_10300500E4F91800visual13.tif'),
      loadGeoRaster('cog_103001008244DA00-visual23.tif')
    ]).then(async ([layerC, layerD]) => {
      if (layer1 && layer2) {
        map.removeLayer(layer1);
        map.removeLayer(layer2);
      }

      if (layer3 && layer4) {
        map.removeLayer(layer3);
        map.removeLayer(layer4);
      }
  
      layer5 = layerC;
      layer6 = layerD;
      layer5.addTo(map);
      layer6.addTo(map);
      if (sideBySideControl) map.removeControl(sideBySideControl);
      map.fitBounds(layer5.getBounds());
      sideBySideControl = L.control.sideBySide(layer5, layer6).addTo(map);
  
      // Attendre que les couches soient rendues
      await ensureLayersRendered();
  
      // Affichez le pie chart après le rendu complet des images
      updatePieChart('village3');
    });
  }