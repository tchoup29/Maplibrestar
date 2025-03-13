// APPEL DE LA CARTE
var map = new maplibregl.Map({
  container: 'map',
  style: 'https://openmaptiles.geo.data.gouv.fr/styles/positron/style.json',
  center: [-1.677858704104453, 48.12133387511066], // lat/long
  zoom: 11.5,
    attributionControl: true,
  customAttribution: 'Votre attribution personnalisée ici'
});



// CHARGEMENT DES DONNES en GeoJSON

// PARC RELAIS
fetch("https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/exports/geojson?lang=fr&timezone=Europe%2FBerlin")
  .then(response => response.json())
  .then(data => {
    // Ajouter un ID unique à chaque entité
    data.features.forEach((feature, i) => {
      feature.properties.id = i;
    });
  
  
  // INTERACTIVITE
  
 map.on('click', (event) => {
  const features = map.queryRenderedFeatures(event.point, {
    layers: ['locations']});

if (!features.length) return;
const clickedPoint = features[0];

flyToStore(clickedPoint);
createPopUp(clickedPoint);

   const activeItem = document.getElementsByClassName('active');
  if (activeItem[0]) {activeItem[0].classList.remove('active');}
  const listing = document.getElementById(
    `listing-${clickedPoint.properties.id}`);
  listing.classList.add('active');
});
  
  
  // CONSTRUCTION DE LA LISTE
  
  function buildLocationList(data) {
  for (const store of data.features) {
    /* Add a new listing section to the sidebar. */
    const listings = document.getElementById('listings');
    const listing = listings.appendChild(document.createElement('div'));
    listing.id = `listing-${store.properties.nom}`;
    listing.className = 'item';

    /* Add the link to the individual listing created above. */
    const link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.id = `link-${store.properties.id}`;
    link.innerHTML = `${store.properties.nom}`;
    link.style.fontSize = "17px";
    link.style.marginBottom = "5px";
    
    /* Add details to the individual listing. */
const details = listing.appendChild(document.createElement('div'));

const availablePlaces = store.properties.jrdinfosoliste;
let emoji = '🟧';  // Valeur par défaut (si inférieur ou égal à 200)

if (availablePlaces < 100) {
    emoji = '🟥';  // Si disponible > 200, on met l'emoji vert
}
    
if (availablePlaces > 200) {
    emoji = '✅';  // Si disponible > 200, on met l'emoji vert
}

details.innerHTML = `État: <b>${store.properties.jrdmentionligne1}</b> / <b>${availablePlaces}</b> places disponibles &nbsp; &nbsp; ${emoji}`;

    
      // INTERACTIVITE AU CLIK

    
      link.addEventListener('click', function () {
  for (const feature of data.features) {
    if (this.id === `link-${feature.properties.id}`) {
      flyToStore(feature);
      createPopUp(feature);
    }
  }
  const activeItem = document.getElementsByClassName('active');
  if (activeItem[0]) {
    activeItem[0].classList.remove('active');
  }
  this.parentNode.classList.add('active');
});
    
    
    } 
  }

    //////////////  AJOUT DONNEES A LA CARTE ////////
map.on('load', async  () => {
  
  
    // TRACES LIGNES Chronostar (via GEOJSON)  

data3 = 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/lignes-du-reseau-star-de-rennes-metropole/exports/geojson?lang=fr&timezone=Europe%2FBerlin';
    
  jQuery.when(
    jQuery.getJSON(data3)
  ).done(function(json) {
    for (i = 0; i < json.features.length; i++) {
      json.features[i].geometry = json.features[i].geometry;
    };
     
    map.addLayer(
    { 'id': 'bhns',
      'type':'line',
      'source': {'type': 'geojson','data': json},
      'filter': ['==', ['get', 'li_sstype'], 'CHRONOSTAR'],
      'paint' : {'line-color' : ['get', 'li_couleur_hex'],
                 'line-width' : 1.5}
    },"tram");
  });
  
  
  
  // TRACES LIGNES TRAM (via GEOJSON)  

data1 = 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/metro-du-reseau-star-traces-de-laxe-des-lignes/exports/geojson?lang=fr&timezone=Europe%2FBerlin';
    
  jQuery.when(
    jQuery.getJSON(data1)
  ).done(function(json) {
    for (i = 0; i < json.features.length; i++) {
      json.features[i].geometry = json.features[i].geometry;
    };
     
    map.addLayer(
    { 'id': 'tram',
      'type':'line',
      'source': {'type': 'geojson','data': json},
      'paint' : {'line-color' : ['match', ['get', 'ligne'],
                                           'a','#ee1d23',
                                           'b','#00893e',
                                            '#000000'],
                 'line-width' : 3}
    },"locations");
  });
  

  
   // PARC RELAIS (via GEOJSON)  
  
const image = await map.loadImage('https://raw.githubusercontent.com/mastersigat/data/main/picto_parking_relais.c697add8.png');
map.addImage('custom-marker', image.data);
  
map.addLayer({id: 'locations',
              type: 'symbol',
              source: {type: 'geojson',
                       data: data},
              layout: {'icon-image': 'custom-marker',
                        'icon-size': 0.13}
      }); 
      
      buildLocationList(data);
   
      
  // Gestion ordre d'affichage des couches
  
  map.moveLayer('tram','bhns','locations',);
  
   
  
   // Ajout Batiment BD TOPO
  
 
map.addSource(
  'BDTOPO', {
    type: 'vector',
    url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
    minzoom: 15,
    maxzoom: 19
    }
             );
  
map.addLayer({
    'id': 'batiments',
    'type': 'fill-extrusion',
    'source': 'BDTOPO',
    'source-layer': 'batiment',
    'paint': {
      'fill-extrusion-color':"lightgrey",
      'fill-extrusion-height':{'type': 'identity','property': 'hauteur'},
      'fill-extrusion-opacity': 0.90,
      'fill-extrusion-base': 0},
  'layout': {'visibility': 'visible'}
});
  

  
  //FIN DU MAP ON pour charger d'autre couches (avant)
    });
  
  
  // FLYTO
  
  function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15,
    pitch: 50,
    beaing: 50,

  });
}
  // FLY TO RETOUR ACCEUIL
 
  	document.getElementById("acceuil").addEventListener("click", function
    () {
    document.querySelectorAll('.maplibregl-popup').forEach(popup => 
                                                            popup.remove());
    map.flyTo({center: [-1.676, 48.110], // lat/long
               	zoom: 11.2,
    	});
	})

  
    // CONFIGURATION DE LA POPUP

function createPopUp(currentFeature) {
  const popUps = document.getElementsByClassName('maplibregl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popUps[0]) popUps[0].remove();

  const popup = new maplibregl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(`<h3>${currentFeature.properties.nom}</h3><h4>${currentFeature.properties.capacitesoliste} places théoriques </h4>` + `<h4>${currentFeature.properties.jrdinfosoliste} places disponibles </h4>`+ `<h4>${currentFeature.properties.jrdinfoelectrique} bornes disponibles </h4>`)
    .addTo(map);
}
  
  
  })
  .catch(error => console.error('Erreur de chargement du GeoJSON:', error));



// Boutons de navigation
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');

// Ajout Échelle cartographique
map.addControl(new maplibregl.ScaleControl({
  maxWidth: 120,
  unit: 'metric'
}));