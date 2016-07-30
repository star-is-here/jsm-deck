
var layer1 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
var layer2 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
var layer3 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
var layer4 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');

var map1 = L.map('map1', {
    layers: [layer1],
    center: [4.85, 31.6],
    zoom: 2
});

map1.attributionControl.setPrefix('');

var map2 = L.map('map2', {
    layers: [layer2],
    center: [4.85, 31.6],
    zoom: 2,
    zoomControl: false
});

map2.attributionControl.setPrefix('');

var map3 = L.map('map3', {
    layers: [layer3],
    center: [4.85, 31.6],
    zoom: 2,
    zoomControl: false
});

map3.attributionControl.setPrefix('');

var map4 = L.map('map4', {
    layers: [layer4],
    center: [4.85, 31.6],
    zoom: 2,
    zoomControl: false
});

var stateLayer1 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity1 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity1 < 1 ? (feature.properties.parity1 > 0.0 ? 'rgba(231, 76, 60,'+(1 - feature.properties.parity1)+')' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      color: feature.properties.parity1 < 1 ? (feature.properties.parity1 > 0.0 ? 'rgba(231, 76, 60,1.0)' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      opacity: .5,
      weight: 1,
      fillOpacity: 1
     };
  },
  onEachFeature: onEachFeature
});

var stateLayer2 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity2 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity2 < 1 ? (feature.properties.parity2 > 0.0 ? 'rgba(231, 76, 60,'+(1 - feature.properties.parity2)+')' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      color: feature.properties.parity2 < 1 ? (feature.properties.parity2 > 0.0 ? 'rgba(231, 76, 60,1.0)' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      opacity: .5,
      weight: 1,
      fillOpacity: 1
     };
  },
  onEachFeature: onEachFeature  
});

var stateLayer3 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity3 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity3 < 1 ? (feature.properties.parity3 > 0.0 ? 'rgba(231, 76, 60,'+(1 - feature.properties.parity3)+')' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      color: feature.properties.parity3 < 1 ? (feature.properties.parity3 > 0.0 ? 'rgba(231, 76, 60,1.0)' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      opacity: .5,
      weight: 1,
      fillOpacity: 1
     };
  },
  onEachFeature: onEachFeature
});

var stateLayer4 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity4 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity4 < 1 ? (feature.properties.parity4 > 0.0 ? 'rgba(231, 76, 60,'+(1 - feature.properties.parity4)+')' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      color: feature.properties.parity4 < 1 ? (feature.properties.parity4 > 0.0 ? 'rgba(231, 76, 60,1.0)' : 'rgba(0,0,0,0.0)') : 'rgba(0,0,0,0.0)',
      opacity: .5,
      weight: 1,
      fillOpacity: 1
     };
  },
  onEachFeature: onEachFeature
});
omnivore.topojson('data/vector/countries_parity.geo.topojson', null, stateLayer1).addTo(map1);
omnivore.topojson('data/vector/countries_parity.geo.topojson', null, stateLayer2).addTo(map2);
omnivore.topojson('data/vector/countries_parity.geo.topojson', null, stateLayer3).addTo(map3);
omnivore.topojson('data/vector/countries_parity.geo.topojson', null, stateLayer4).addTo(map4);

// Sync maps using https://www.mapbox.com/mapbox.js/example/v1.0.0/sync-layer-movement/ tutorial
map1.on('moveend', follow).on('zoomend', follow);
map2.on('moveend', follow).on('zoomend', follow);
map3.on('moveend', follow).on('zoomend', follow);
map4.on('moveend', follow).on('zoomend', follow);

// quiet is a cheap and dirty way of avoiding a problem in which one map
// syncing to another leads to the other map syncing to it, and so on
// ad infinitum. this says that while we are calling sync, do not try to 
// loop again and sync other maps
var quiet = false;
function follow(e) {
    if (quiet) return;
    quiet = true;
    if (e.target === map1) { sync(map2, e); sync(map3, e); sync(map4, e); }
    if (e.target === map2) { sync(map1, e); sync(map3, e); sync(map4, e); }
    if (e.target === map3) { sync(map1, e); sync(map2, e); sync(map4, e); }
    if (e.target === map4) { sync(map1, e); sync(map2, e); sync(map3, e); }
    quiet = false;
}

function zoomToFeature(e) {
    map1.fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#2c3e50',
        dashArray: '5, 5',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    stateLayer1.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (d) {
    this._div.innerHTML =(d ?
        '<b>' + d.name + '</b><br />' + '2009: ' + d.parity1 + '<br />2010: ' + d.parity2 + '<br />2010: ' + d.parity3 + '<br />2010: ' + d.parity4
        : 'Hover over a nation<br />for Gender Parity Index');
};

info.addTo(map2);

var legend1 = L.control({position: 'bottomright'});

legend1.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = 
      '<b>2009</b>';

    return div;
};

legend1.addTo(map1);

var legend2 = L.control({position: 'bottomright'});

legend2.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = 
      '<b>2010</b>';

    return div;
};

legend2.addTo(map2);

var legend3 = L.control({position: 'bottomright'});

legend3.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = 
      '<b>2011</b>';

    return div;
};

legend3.addTo(map3);

var legend4 = L.control({position: 'bottomright'});

legend4.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = 
      '<b>2012</b>';

    return div;
};

legend4.addTo(map4);

// sync simply steals the settings from the moved map (e.target)
// and applies them to the other map.
function sync(map, e) {
    map.setView(e.target.getCenter(), e.target.getZoom(), {
        animate: false,
        reset: true
    });
}
