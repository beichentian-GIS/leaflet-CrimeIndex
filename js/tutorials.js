/* Codes from 'Leaflet Quick Start Guide' */

//define a variable named "mymap", initialize the map on the "mapid" div (in 'index.html') with a given center and a zoom level assigned by the method .setView()
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//instantiate a tile layer object given a URL template loaded from MapBox 
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //set up other options including 'attribution', 'maxZoom' (in this case set the maximum zoom level to 18), 'id' (basemap id), and 'accessToken' (MapBox access token), then apply them along with the URL to the variable "mymap" to create the basemap 
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'davistian123.92604562',
    accessToken: 'pk.eyJ1IjoiZGF2aXN0aWFuMTIzIiwiYSI6ImNpdGkzbHZmcDAzbWcyeW1remptajNsdmYifQ.SORQG7JQe72iomMt3l6lQg'
}).addTo(mymap);

//define a variable named "marker", instantiates a marker object given a geographical point (in this case 51.5 N, 0.09 W) then add the marker object to the map  
var marker = L.marker([51.5, -0.09]).addTo(mymap);

//define a variable named "circle", instantiates a circle object given a geographical point (in this case 51.508 N, 0.11 W) and a series of optional objects including the circle's fill color, opacity, and radius then add the circle object to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

//define a variable named "polygon", instantiates a polygon object given three geographical points (in this case the polygon created will be a triangle) then add the polygon object to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

//set up pop-up interaction to the marker object. The pop-up content will be opened then displayed once the users click the marker object on the map
//the method '.openPopup()' is to make sure that only one pop-up will be open at one time for the clicked marker object 
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
//set up pop-up interaction to the circle object. The pop-up content will be opened then displayed once the users click the circle object on the map
circle.bindPopup("I am a circle.");
//set up pop-up interaction to the polygon object. The pop-up content will be opened then displayed once the users click the polygon object on the map
polygon.bindPopup("I am a polygon.");

//define a variable named "popup", instantiates a Popup object given the popup object a location (in this case 51.5 N, 0.09 W) and displayed content
//the method .openOn() handles an automatic closing of a previously opened popup when opening a new one
//in this case, this independent popup will be automatically displayed on the map when the map is firstly loaded to the browser
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

//define a variable named "popup", instantiates a Popup object 
var popup = L.popup();

//define a function named "onMapClick" with a parameter "e"
function onMapClick(e) {
    popup
		//set the geographical position where the independent popup will be opened
        .setLatLng(e.latlng)
		//set the popup content. Within the content, firstly convert the clicked position to string then concatenate the position info to "you clicked the map at "
        .setContent("You clicked the map at " + e.latlng.toString())
		//the method .openOn() handles an automatic closing of a previously opened popup when opening a new one
        .openOn(mymap);
}

//execute the function "onMapClick" only when users click on somewhere on the map 
mymap.on('click', onMapClick);



/* Codes from 'Using GeoJSON from Leaflet' */

//define a variable named "geojsonFeature"
var geojsonFeature = {
	//define the variable's type and the kinds of properties
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
	//define the variable's geometry info (in this case a geographical point that locates at 104.99404 W, 39.75621 N)
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//create a GeoJSON point layer for the point feature created above, then add the point layer onto the basemap
L.geoJSON(geojsonFeature).addTo(map);

//define a variable named "myLines"
var myLines = [{
	//define the type of "myLines" as "LineString" consisted of an array of valid GeoJSON objects defined by the corresponding coordinates
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//define a variable named "myLayer"
//then create an empty GeoJSON layer and assign it to variable "myLayer" so that more features can be added to it later
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(geojsonFeature);

//define a variable named "myStyle", then assign three styling properties (color, weight, and opacity) to the variable 
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//apply the style properties stored in "myStyle" to the GeoJSON objects stored in "myLines" then add them onto the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

//define a variable named "states"
//then create and store two GeoJSON objects into "states" (in this case two polygons, one polygon's party property is "Republican" while the other one is "Democrat")
//both of the polygons are defined by four different geographic points/coordinates
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//create a function for stylizing the colors of the two polygons based on their party properties, then add the stylized polygons onto the map 
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

//define a variable named "geojsonMarkerOptions"
//then assign six styling properties (radius, fillcolor, color, weight, opacity, and fill opacity) to the variable 
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//by using function "pointToLayer", create a vector point layer then apply those style properties stored in "geojsonMarkerOptions" to the GeoJSON points in the layer. Then add the stylized point layer onto the map
L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

//define a function named "onEachFeature", which is used to attach specific popup content to specific GeoJSON feature when the feature is clicked 
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

//define a variable named "geojsonFeature"
var geojsonFeature = {
	//define the variable's type and the kinds of properties, including the popup content 
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
	//define the variable's geometry info (in this case a geographical point that locates at 104.99404 W, 39.75621 N)
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//add the GeoJSON point feature with clicking-popup effect applied onto the map
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

//define a function named "someFeatures"
var someFeatures = [{
	//define the variable's type and the kinds of properties 
    "type": "Feature",
	//"name" property "Coors Field" will be displayed on the map
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
	//define the variable's geometry info (in this case a geographical point that locates at 104.99404 W, 39.75621 N)
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
	//define the variable's type and the kinds of properties 
    "type": "Feature",
	//"name" property "Busch Field" will not be displayed on the map
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
	//define the variable's geometry info (in this case a geographical point that locates at 104.99404 W, 39.75621 N)
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//add the GeoJSON point feature with property filtering effect applied onto the map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
