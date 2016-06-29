
var layer1 = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {attribution: 'MDG Gender Parity Index for 2009'});
var layer2 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {attribution: 'MDG Gender Parity Index for 2010'});
var layer3 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {attribution: 'MDG Gender Parity Index for 2011'});
var layer4 = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {attribution: 'MDG Gender Parity Index for 2012'});

var map1 = L.map('map1', {
    layers: [layer1],
    center: [43.935299,116.051414],
    zoom: 2
});

// map1.attributionControl.setPrefix('');

var map2 = L.map('map2', {
    layers: [layer2],
    center: [43.935299,116.051414],
    zoom: 2,
    zoomControl: false
});

// map2.attributionControl.setPrefix('');

var map3 = L.map('map3', {
    layers: [layer3],
    center: [43.935299,116.051414],
    zoom: 2,
    zoomControl: false
});

// map3.attributionControl.setPrefix('');

var map4 = L.map('map4', {
    layers: [layer4],
    center: [43.935299,116.051414],
    zoom: 2,
    zoomControl: false
});

var stateLayer1 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity1 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity1 < 0.85 ? 'rgba(241, 196, 15,1.0)' : 'rgba(0,0,0,0.0)',
      color: 'rgb(46,204,113)',
      opacity: .5,
      weight: 2,
      fillOpacity: 1
     };
  }
});

var stateLayer2 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity2 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity2 < 0.85 ? 'rgba(192, 57, 43,1.0)' : 'rgba(0,0,0,0.0)',
      color: 'rgb(142,68,173)',
      opacity: .5,
      weight: 2,
      fillOpacity: 1
     };
  }
});

var stateLayer3 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity3 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity3 < 0.85 ? 'rgba(192, 57, 43,1.0)' : 'rgba(0,0,0,0.0)',
      color: 'rgb(52,152,219)',
      opacity: .5,
      weight: 2,
      fillOpacity: 1
     };
  }
});

var stateLayer4 = L.geoJson(null, {
  filter: function(feature, layer){
    return feature.properties.parity4 != null ? true : false;
  },
  style: function(feature, layer){
    return { 
      fillColor: feature.properties.parity4 < 0.85 ? 'rgba(241, 196, 15,1.0)' : 'rgba(0,0,0,0.0)',
      color: 'rgb(241,204,113)',
      opacity: .5,
      weight: 2,
      fillOpacity: 1
     };
  }
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

// sync simply steals the settings from the moved map (e.target)
// and applies them to the other map.
function sync(map, e) {
    map.setView(e.target.getCenter(), e.target.getZoom(), {
        animate: false,
        reset: true
    });
}
