/* Stylesheet by Beichen Tian, 2017.03 */

//function to instantiate the Leaflet map
function createMap(){
	//add esri base tilelayer
	var DarkGray=L.esri.basemapLayer("DarkGray",{minZoom:4}),
	Topographic=L.esri.basemapLayer("Topographic",{minZoom:4});
	NationalGeographic=L.esri.basemapLayer("NationalGeographic",{minZoom:4});
	Streets=L.esri.basemapLayer("Streets",{minZoom:4});
	Imagery=L.esri.basemapLayer("Imagery",{minZoom:4});
	//create the map
	var map=L.map('mapid', {
		center: [38, -96.4],
		zoom: 5,
		minZoom:4,
		layers:[DarkGray],
		maxBounds:[
			[75,-170],
			[0,-30]
		],
	});
	
	var baseMaps={
		"DarkGray":DarkGray,
		"Topographic":Topographic,
		"National Geographic":NationalGeographic,
		"Streets":Streets,
		"Imagery":Imagery
	};
	//add all the basemap options to the map
	L.control.layers(baseMaps).addTo(map);
	//add navigation bar to the map
	L.control.navbar().addTo(map);
	//L.esri.basemapLayer("DarkGray").addTo(map);
	getData(map);
};

//function to search each individual city showed on the map
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
  			map.setView(latlng,14); // access the zoom
		}
	});
	map.addControl(controlSearch);
	//customize the interface affordance and the extension length for the search bar
	$('#searchtext9').attr('size','36').attr('placeholder','Search the displayed U.S. populous cities');
};

//function to calculate the radius for each proportional symbol
function calcPropRadius(attValue){
	console.log(attValue)
	//scale factor to adjust symbol size evenly
	var scaleFactor=6;
	//area based on attribute value and scale factor
	var area=attValue*scaleFactor;
	//radius calculated based on area
	var radius=Math.sqrt(area/Math.PI);
	
	if (isNaN(radius)){radius=10}
	
	return radius;
}

//function to set up conditional colors for each point feature based on the crime index changes
function getColor(d){
	console.log(d)
	return d>258? '#FF4500':
	       d<=258? '#228B22':
	               '#D3D3D3';
}

//function to create popup content and interactivity for each proportional symbol
function Popup(properties, attribute, layer, radius){
	this.properties=properties;
	this.attribute=attribute;
	this.layer=layer;
	//add formatted attribute to panel content string
	this.year=attribute.split("_")[1];
	this.crime=this.properties[attribute];
	//add city to popup content string
	this.content="<p><b>City: </b>"+this.properties.City+"</p><p><b>Crime Index in "+this.year+": </b>"+this.crime+"</p>";
	this.popupContent="<p><b>City: </b>"+this.properties.City+"</p>";
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
			this.setStyle({fillColor:getColor(properties[attribute])});
			//this.setStyle({fillColor:"#FF4500"});
			this.setStyle({color:"#000"});
		},

		click:function(){
			//console.log(this)
			$("#panel2").html(this._popup._content);
		}
	});
};

//function to convert markers to circle markers
function pointToLayer(feature,latlng,attributes){

	//determine which attribute to visualize with proportional symbols
	//assign the current attribute based on the first index of the attributes array
	var attribute=attributes[0];

	//create marker options
    var options = {
		radius: 7,
		fillColor: getColor(feature.properties[attribute]),
        //fillColor: "#FF4500",
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

	//return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//function to add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    var pointLayer=L.geoJson(data,{
		pointToLayer: function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		}
	//onEachFeature: onEachFeature,
	}).addTo(map);
	//call search function to enable search for each created point feature 
	search(map,data,pointLayer)
};

//function to update the attributes (crime index, radius) for the point features through sequence animation
function updatePropSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//update the layer style and popup
			//access feature properties
			var props=layer.feature.properties;

			//update each feature's radius based on new attribute values
			var radius=calcPropRadius(props[attribute]);
			layer.setRadius(radius);
			
			layer.setStyle({fillColor: getColor(props[attribute])})

			//create new popup
			var popup=new Popup(props, attribute, layer, radius);

			//add popup to circle marker
			popup.bindToLayer();
		};
	});
	updateLegend(map,attribute);
};

//function to create new sequence control
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

	//set slider attributes
	$(".range-slider").attr({
		max:14,
		min:0,
		value:0,
		step:1
	});

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

//function to create the temporal legend for the map
function createLegend(map, attributes){
	var LegendControl=L.Control.extend({
		options:{
			position:"bottomright"
		},

		onAdd:function(map){
			//create the control container with a particular class name
			var container=L.DomUtil.create("div","legend-control-container");

			//add temporal legend div to container
			$(container).append('<div id="temporal-legend">')

			//start attribute legend svg string
			var svg='<svg id="attribute-legend" width="250px" height="220px">';
			//var svg='<svg id="attribute-legend" width="500px" height="500px">';
			var svg1='<svg id="attribute-legend" width="250px" height="220px">';
			var svg2='<svg id="attribute-legend" width="250px" height="220px">';
			var svg3='<svg id="attribute-legend" width="250px" height="220px">';
			
			//array of circle names to base loop on
			var circles={
				max:35,
				mean:70,
				min:110
			};
			//loop through to add each circle and text tp svg string
			for (var circle in circles){
				//circle string
				svg+='<circle class="legend-circle" id="' + circle + '" fill="#FF4500" fill-opacity="0" stroke="#000000" stroke-width="1" cx="165"/>';

				//text string
				svg+='<text id="'+circle+'-text" x="40" y="'+circles[circle]+'"></text>';
			};
			
			//close svg string
			svg+="</svg>";
			
			svg1+='<circle class="legend-circle" fill="#FF4500" fill-opacity="0.4" stroke="#000000" stroke-width="1" cx="165"/>';
			svg1+="</svg>";
			
			svg2+='<circle class="legend-circle" fill="#228B22" fill-opacity="0.4" stroke="#000000" stroke-width="1" cx="165"/>';
			svg2+="</svg>";
			
			svg3+='<circle class="legend-circle" fill="#D3D3D3" fill-opacity="0.4" stroke="#000000" stroke-width="1" cx="165"/>';
			svg3+="</svg>";
			
			//add attribute legend svg to container
			$(container).append(svg);
			
			$(container).append(svg1);
			$(container).append(svg2);
			$(container).append(svg3);
			console.log(container);
			return container;
			
		}
	});
	map.addControl(new LegendControl());
	
	//$(container).append(svg1);
	//$(container).append(svg2);
	//$(container).append(svg3);
	
	updateLegend(map,attributes[0]);
};

//calculate the max, mean, and min values for a given attribute
function getCircleValues(map,attribute){
	//start with min at highest possible and max at lowest possible number
	var min=Infinity,
	max=-Infinity;

	map.eachLayer(function(layer){
		//get the attribute value
		if (layer.feature){
			var attributeValue=Number(layer.feature.properties[attribute]);

			//test for min
			if (attributeValue<min){
				min=attributeValue;
			};

			//test for max
			if (attributeValue>max){
				max=attributeValue;
			};
		};
	});

	//set mean
	var mean=(max+min)/2;

	//return values as an object
	return{
		max:max,
		mean:mean,
		min:min
	};
};

//function to update the legend with new attribute
function updateLegend(map,attribute){
	//create content for legend
	var year=attribute.split("_")[1];
	var content="<b>Crime Index in "+year+"</b>";
	content+="<p>Crime Index Average: 258</p>"
	content+="<p>(for all U.S. cities)</p>"
	//replace legend content
	$('#temporal-legend').html(content);

	//get the max, mean, and min values as an object
	var circleValues=getCircleValues(map,attribute);

	for (var key in circleValues){
		//get the radius
		var radius=calcPropRadius(circleValues[key]);

		//assign the cy and r attribute
		$('#'+key).attr({
			cy:110-radius,
			r:radius
		});
		//add legend text
		$('#'+key+'-text').text(Math.round(circleValues[key]*100)/100);
	};
};

//function to read through and process the original crime index data
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
			createLegend(map, attributes)
        }
    });
};

$(document).ready(createMap);
