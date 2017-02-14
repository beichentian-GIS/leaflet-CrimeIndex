/* Stylesheet by Beichen Tian, 2017.01 */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [39.5, -98.35],
        zoom: 4
    });
	
	//add esri base tilelayer
	L.esri.basemapLayer("DarkGray").addTo(map);
	getData(map);
};
	/*
    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};
*/
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/USBigCitiesCrimeGeo.geojson", {
        dataType: "json",
        success: function(response){
			//create marker options
            var geojsonMarkerOptions = {
				radius: 7,
                fillColor: "#FF4500",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
			};
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response,{
			    pointToLayer: function (feature, latlng){
                return L.circleMarker(latlng, geojsonMarkerOptions);
				},
				onEachFeature: onEachFeature,
				//use filter function to only show cities with 2015 populations greater than 20 million
                //filter: function(feature, layer) {
                    //return feature.properties.Pop_2015 > 20;
                //}
			}).addTo(map);
        }
    });
};

$(document).ready(createMap);