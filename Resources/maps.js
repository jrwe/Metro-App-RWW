Titanium.UI.currentWindow.addEventListener('mapViewr',function(e)
{
var mapsWin;

mapsWin = Titanium.UI.createWindow({  
		    title:'Metrolicious: Bus Stops Map',
		    backgroundColor:'black',
			url:'maps.js'
		});

function mapViewr()
{
	var stopsArray = Titanium.UI.currentWindow.stopsArray;
	
	var la1 = stopsArray[0].latitude;
	var lo1 = stopsArray[0].longitude;
	
	var la2 = stopsArray[stopsArray.length-1].latitude;
	var lo2 = stopsArray[stopsArray.length-1].longitude;
			
	var stopsMap = Titanium.Map.createView(
	{
	    mapType: Titanium.Map.STANDARD_TYPE,
	    region: {
	    	latitude:la1, longitude:lo1, 
	        latitudeDelta:Math.abs(la1 - la2), longitudeDelta:Math.abs(lo1 - lo2)
	    },
	    animate:true,
	    regionFit:true,
	    userLocation:true,
	    annotations:stopsArray
	});
	
	stopsMap.addEventListener('click', function(e)
	{
		curAnnotation = e.annotation;
		var curLocation = String(curAnnotation.latitude + ',' + curAnnotation.longitude);
		var ep = config.endpoints;
		var re1 = /{keywords}/gi;
		var re2 = /{location}/gi;

		var endpoint = ep.eventful.replace(re1, 'events');
		endpoint = endpoint.replace(re2, curLocation);
		ep = endpoint;			
		
		//win2.remove(activeMap);
		jsonGettr(onLoad_eventful, ep);
	});
	
	activeMap = stopsMap;
	
	//TODO: create loading / unloading module
	//loadingWin.remove(loadingMessage);

	mapsWin.open();
	mapsWin.add(activeMap);
};

    mapViewr();
});
			
