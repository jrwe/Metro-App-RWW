(function()
{
	var config = 
	{
		endpoints: {
			baseurl: 'http://api.metro.net/agencies/lametro/',
			routes: 'routes/',
			stops: 'routes/{id}/stops/',
			eventful: 'http://api.eventful.com/json/events/search?keywords={keywords}&location={location}&app_key=4jSM4wsC3xQDkwZV&within=1'
		}
	};
	
	var xhr = Titanium.Network.createHTTPClient();
	var win2;
	var curRoute;
	var curAnnotation;
	var curEvent;
	
	var init = function()
	{
		// this sets the background color of the master UIView (when there are no windows/tab groups on it)
		Titanium.UI.setBackgroundColor('#000');
		
		win2 = Titanium.UI.createWindow({  
		    title:'Metro Mobile App',
		    backgroundColor:'#fff'
		});
		
		win2.open({fullscreen:false});
		
		xhr.onerror = function(e)
		{
			var x = 5;
			//	l2.text = e.error;
		};
		
		var ep = config.endpoints;
		jsonGettr(onLoad_routes, ep.baseurl + ep.routes);
	}
	
	var jsonGettr = function(callback, url)
	{
		xhr.onload = callback;
		xhr.open('GET', url);
		xhr.send();
	};
	
	function onLoad_routes()
	{
		var json = JSON.parse(this.responseText);
		
		// create table view data object
		var data = [];
		var routes = json.items;
		
		for(var i = 0; i < routes.length; i++)
		{
			data.push({
				title: routes[i].display_name,
				id: routes[i].id 
			});
		}
		
		tableviewAdder(data, function(tableview)
		{
			// create table view event listener
			tableview.addEventListener('click', function(e)
			{
				curRoute = e.rowData;
				var ep = config.endpoints;
				var re = /{id}/gi;
				
				var endpoint = ep.baseurl + ep.stops.replace(re, curRoute.id);
				jsonGettr(onLoad_stops, endpoint);			
			});
			
			// win2.add(label2);
			win2.add(tableview);
		});
	};
	
	function tableviewAdder(data, callback)
	{
		// create table view
		var tableview = Titanium.UI.createTableView({
			data:data
		});
		
		callback(tableview);
	};
	
	function onLoad_stops()
	{
		var json = JSON.parse(this.responseText);
		var stopsArray = [];
		var stops = json.items;
		
		for(var i = 0; i < json.items.length; i++)
		{
			var annotation = Titanium.Map.createAnnotation(
			{
			    latitude:stops[i].latitude,
			    longitude:stops[i].longitude,
			    title:stops[i].display_name,
			    subtitle:'Click here to see local events in the area!/nPowered by Rewire Web',
			    pincolor:Titanium.Map.ANNOTATION_RED,
			    animate:true,
			    leftButton: 'android/appicon.png',
			});
			
			stopsArray.push(annotation);
			
			mapViewr(stopsArray);
		}
	};
			
	
	function mapViewr(stopsArray)
	{
		var la1 = stopsArray[0].latitude;
		var lo1 = stopsArray[0].longitude;
		
		var la2 = stopsArray[stopsArray.length-1].latitude;
		var lo2 = stopsArray[stopsArray.length-1].longitude;
		
		
		var mapview = Titanium.Map.createView(
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
		
		mapview.addEventListener('click', function(e)
		{						
			curAnnotation = e.annotation;
			var curLocation = String(curAnnotation.latitude + ',' + curAnnotation.longitude);
			var ep = config.endpoints;
			var re1 = /{keywords}/gi;
			var re2 = /{location}/gi;

			var endpoint = ep.eventful.replace(re1, 'events');
			endpoint = endpoint.replace(re2, curLocation);
			jsonGettr(onLoad_eventful, endpoint);			
		});
		
		var x = 5;
		// win2.remove(tableview);
		//win2.add(mapview);
	};
	
	function onLoad_eventful()
	{
		var json = JSON.parse(this.responseText);
		
		// create table view data object
		var data = [];
		var events = json.events.event;
		
		for(var i = 0; i < events.length; i++)
		{
			data.push({
				title: events[i].title,
				latitude: events[i].latitude,
				longitude: events[i].longitude
			});
		}
		
		tableviewAdder(data, function(tableview)
		{
			// create table view event listener
			tableview.addEventListener('click', function(e)
			{
				curEvent = e.rowData;
			});
			
			// win2.add(label2);
			win2.add(tableview);
		});
	}
	
	
	init();
})();