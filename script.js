let villageData = {};

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
          labels: ['Détruite', 'Non détruite'],
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
                  legend: {
                      position: 'top',
                  },
              }
          }
      });
  }

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

let layer1, layer2, layer3, layer4 ;
let sideBySideControl;

// Charger le premier jeu de couches
fetch('10300500E4F91800visual11.tif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
      parseGeoraster(arrayBuffer).then(georaster => {
          layer1 = new GeoRasterLayer({
              georaster: georaster,
              resolution: 200,
          });
          map.fitBounds(layer1.getBounds());

          fetch('103001008244DA00-visual21.tif')
              .then(response => response.arrayBuffer())
              .then(arrayBuffer => {
                  parseGeoraster(arrayBuffer).then(georaster => {
                      layer2 = new GeoRasterLayer({
                          georaster: georaster,
                          resolution: 200,
                      });
                      if (sideBySideControl) map.removeControl(sideBySideControl);
                      sideBySideControl = L.control.sideBySide(layer1, layer2).addTo(map);
                  });
              });
      });
  });

// Charger le second jeu de couches
fetch('10300500E4F91800visual12.tif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
      parseGeoraster(arrayBuffer).then(georaster => {
          layer3 = new GeoRasterLayer({
              georaster: georaster,
              resolution: 200,
          });
          
          fetch('103001008244DA00-visual22.tif')
              .then(response => response.arrayBuffer())
              .then(arrayBuffer => {
                  parseGeoraster(arrayBuffer).then(georaster => {
                      layer4 = new GeoRasterLayer({
                          georaster: georaster,
                          resolution: 200,
                      });
                  });
              });
      });
  });




// Fonctions pour basculer entre les couches
function showFirstLayerSet() {
    
    if (layer3 && layer4) {
        map.removeLayer(layer3);
        map.removeLayer(layer4);
    }


    if (layer1 && layer2) {
        layer1.addTo(map);
        layer2.addTo(map);
        if (sideBySideControl) map.removeControl(sideBySideControl);
        map.fitBounds(layer1.getBounds());
        sideBySideControl = L.control.sideBySide(layer1, layer2).addTo(map);
    }
    updatePieChart('village1');  // Mettez à jour avec les données de village1
}

function showSecondLayerSet() {
    
    if (layer1 && layer2) {
        map.removeLayer(layer1);
        map.removeLayer(layer2);
    }
    if (layer3 && layer4) {
        layer3.addTo(map);
        layer4.addTo(map);
        if (sideBySideControl) map.removeControl(sideBySideControl);
        map.fitBounds(layer3.getBounds());
        sideBySideControl = L.control.sideBySide(layer3, layer4).addTo(map);
    }
    updatePieChart('village2');  // Mettez à jour avec les données de village2
}