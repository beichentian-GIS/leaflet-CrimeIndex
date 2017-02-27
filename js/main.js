/* Stylesheet by Beichen Tian, 2017.01 */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [38, -97],
        zoom: 5,
		minZoom:4,
    });
	
	//add esri base tilelayer
	L.esri.basemapLayer("DarkGray").addTo(map);
	getData(map);
};

/*
var DarkGray=L.esri.basemapLayer("DarkGray",{minZoom:4}),
	Topographic=L.esri.basemapLayer("Topographic",{minZoom:4});

var map=L.map('mapid', {
	center: [38, -97],
    zoom: 5,
	minZoom:4
	layers:[DarkGray]
});
*/
function search(map, data, pointLayer){
	var controlSearch = new L.Control.Search({
		position:'topleft',		
		layer: pointLayer,
		propertyName:"City",
		marker: false,
		moveToLocation: function(latlng, title, map) {
			//map.fitBounds( latlng.layer.getBounds() );
			console.log(latlng)
			//var zoom = map.getBoundsZoom(latlng.layer.getBounds());
  			map.setView(latlng,12); // access the zoom
		}
	});
	map.addControl(controlSearch);
};

function calcPropRadius(attValue){
	//scale factor to adjust symbol size evenly
	var scaleFactor=3;
	//area based on attribute value and scale factor
	var area=attValue*scaleFactor;
	//radius calculated based on area
	var radius=Math.sqrt(area/Math.PI);
	return radius;
}

function Popup(properties, attribute, layer, radius){
	this.properties=properties;
	this.attribute=attribute;
	this.layer=layer;
	//add formatted attribute to panel content string
	this.year=attribute.split("_")[1];
	this.crime=this.properties[attribute];
	//add city to popup content string
	this.content="<p><b>City: </b>"+this.properties.City+"</p><p><b>Crime Index in "+this.year+": </b>"+this.crime+"</p>";
	
	//replace the layer popup
	this.bindToLayer=function(){
		this.layer.bindPopup(this.content,{
			offset:new L.Point(0,-radius)
		});
	};
	//event listeners to open popup on hover and fill panel on click
	this.layer.on({
		mouseover:function(){
			this.openPopup();
				this.setStyle({fillColor:"red"});
				this.setStyle({color:"#000"});
		},
		
		mouseout:function(){
			this.closePopup();
				this.setStyle({fillColor:"#FF4500"});
				this.setStyle({color:"#000"});
		},
		
		click:function(){
			$("#panel2").html(this.content);
		}
	});
};

//function to convert markers to circle markers
function pointToLayer(feature,latlng, attributes){
	/*
	var baseMaps={
		"Dark Gray":DarkGray,
		"Topographic":Topographic
	};
	*/
	//determine which attribute to visualize with proportional symbols
	//assign the current attribute based on the first index of the attributes array
	var attribute=attributes[0];
	
	//create marker options
    var options = {
		radius: 7,
        fillColor: "#FF4500",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.4
	};
	
	//for each feature, determine its value for the the selected attribute 
	var attValue=Number(feature.properties[attribute]);
	//give each feature's circle marker a radius based on its attribute value
	options.radius=calcPropRadius(attValue);
	
	//create circle marker layer
	var layer=L.circleMarker(latlng, options);
	
	//create new popup
	var popup=new Popup(feature.properties, attribute, layer, options.radius);
	
	//add popup to circle marker
	popup.bindToLayer();
	//createPopup(feature.properties, attribute, layer, options.radius);
	/*
	//build popup content string
	var popupContent="<p><b>City: </b>"+feature.properties.City+"</p>";
	
	//add formatted attribute to popup content string
	var year= attribute.split("_")[1];
	popupContent+="<p><b>Crime Index in "+year+": </b>"+feature.properties[attribute]+"</p>";
	
	//bind the popup to the circle marker
	layer.bindPopup(popupContent,{
		offset:new L.Point(0,-options.radius)
		closeButton: false 
	});
	
	//event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#pane2").html(panelContent);
        }
    });
	*/
	//return the circle marker to the L.geoJson pointToLayer option
    return layer;
	/*
	var cities = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {           
			//create circle marker layer
			var layer = L.circleMarker(latlng, options);
			return layer;
		}
	});
	
	var overlayMaps = {
		"Cities": cities
	};
	
	var overlayMaps=
	L.control.layers(baseMaps,overlayMaps).addTo(map);
	*/
};

//add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    var pointLayer=L.geoJson(data,{
		pointToLayer: function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		}
	//onEachFeature: onEachFeature,		
	}).addTo(map);
	
	search(map,data,pointLayer)
};

function updatePropSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//update the layer style and popup
			//access feature properties
			var props=layer.feature.properties;
			
			//update each feature's radius based on new attribute values
			var radius=calcPropRadius(props[attribute]);
			layer.setRadius(radius);
			
			//create new popup
			var popup=new Popup(props, attribute, layer, radius);
			
			//add popup to circle marker
			popup.bindToLayer();
			//createPopup(props, attribute, layer, radius);
			/*
			//add city to popup content string
			var popupContent="<p><b>City: </b>"+props.City+"</p>";
			
			//add formatted attribute to panel content string
			var year=attribute.split("_")[1];
			popupContent+="<p><b>Crime Index in "+year+": </b>"+props[attribute]+"</p>";
			
			//replace the layer popup
			layer.bindPopup(popupContent,{
				offset: new L.Point(0,-radius)
			});	
			*/
		};
	});
};

function updatePanel(properties, attribute, layer){
	
    var popupContent="<p><b>City: </b>"+properties.City+"</p>";
	// add extra information
    popupContent+="<p><b>Crime Index in "+year+": </b>"+properties[attribute]+"</p>";
	
	if (properties.City == $(".City").html())
	{
	$("#panel2").html(popupContent);	
	
	};
	layer.on({
        click: function(){
			
            $("#panel2").html(popupContent);
			
        }
    });
	
};

//create new sequence control
function createSequenceControls(map, attributes){
	var SequenceControl=L.Control.extend({
		options:{
			position:"bottomleft"
		},
		
		onAdd:function(map){
			//create the control container div with a a particular class name
			var container=L.DomUtil.create("div","sequence-control-container");
			
			//create range input element (slider)
			$(container).append('<input class="range-slider" type="range">');
			
			//add skip buttons
			$(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
			$(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
			
			//kill any mouse event listeners on the map
			$(container).on('mousedown dblclick',function(e){
				L.DomEvent.stopPropagation(e);
			});
			return container;
		}
	});
	map.addControl(new SequenceControl());
	/*
	//create range input element (slider)
	$("#panel1").append('<input class="range-slider" type="range">');
	*/
	//set slider attributes
	$(".range-slider").attr({
		max:14,
		min:0,
		value:0,
		step:1
	});
	
	//add skip buttons
	$("#panel1").append("<button class='skip' id='reverse'>Reverse</button>");
	$("#panel1").append("<button class='skip' id='forward'>Skip</button>");
	
	//replace button contents with images
	$("#reverse").html("<img src='img/reverse.png'>");
	$("#forward").html("<img src='img/forward.png'>");
	
	//click listener for buttons
	$(".skip").click(function(){
		//get the old index value
		var index=$(".range-slider").val();
		
		//increment or decrement depending on the button clicked
		if ($(this).attr("id")=="forward"){
			index++;
			//if past the last attribute, wrap around to the first attribute
			index= index > 14 ? 0 : index;
		} else if ($(this).attr("id")=="reverse"){
			index--;
			//if past the first attribute, wrap around to the last attribute
			index= index < 0 ? 14 : index;
		};
		
		//update slider
		$(".range-slider").val(index);
		
		//pass new attribute to update symbols
		updatePropSymbols(map,attributes[index]);
	});
	
	//input listener for slider
	$(".range-slider").on("input",function(){
		//get the new index value
		var index=$(this).val();
		
		//pass new attribute to update symbols
		updatePropSymbols(map,attributes[index]);
	});
};

function createLegend(map, attributes){
	var LegendControl=L.Control.extend({
		options:{
			position:"bottomright"
		},
		
		onAdd:function(map){
			//create the control container with a particular class name
			var container=L.DomUtil.create("div","legend-control-container");
			
			//create temporal legend
			
			
			return container;
		}
	});
	map.addControl(new LegendControl());
};

function processData(data){
	//empty array to hold attributes
	var attributes=[];
	
	//properties of the first feature in the dataset
	var properties=data.features[0].properties;
	
	//push each attribute name into attribute array
	for (var attribute in properties){
		//only take attributes with population values
		if (attribute.indexOf("Cri")> -1){
			attributes.push(attribute);
		};
	};
	//console.log(attributes);
	return attributes;
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/USBigCitiesCrimeGeo.geojson", {
        dataType: "json",
        success: function(data){
			//create an attributes array
			var attributes=processData(data);
			
			//call function to create proportional symbols
			createPropSymbols(data,map,attributes);
			createSequenceControls(map,attributes);
        }
    });
};

$(document).ready(createMap);