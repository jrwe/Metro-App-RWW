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

	var win1;
	var eventsWin;
	var loadingWin;

	var curRoute;
	var curAnnotation;
	var curEvent;

	var searchCtr;
	
	var stopsArray = [];
	

	var loadingMessage = Titanium.UI.createLabel(
	{
		id:'loadingMessage',
		text:'Please hold on... loading... Like waiting for the bus! :)',
		width:200,
		height:150,
		top:10,
		color:'#000',
		textAlign:'center'
	});

	var activeTable;
	var activeMap;


	var init = function()
	{
		// this sets the background color of the master UIView (when there are no windows/tab groups on it)
		Titanium.UI.setBackgroundColor('#000');
		
		win1 = Titanium.UI.createWindow({  
		    title:'Metrolicious',
		    backgroundColor:'black',
		    exitOnClose: true
		});

		eventsWin = Titanium.UI.createWindow({  
		    title:'Metrolicious: Events around your stop',
		    backgroundColor:'black',
			fullscreen:false
		    //url:'eventsTable.js'
		});

		loadingWin = Titanium.UI.createWindow({  
		    title:'Metrolicious - Loading ...',
		    backgroundColor:'white'
		});

		xhr.onerror = function(e)
		{
			var x = 5;
			//	l2.text = e.error;	
		};

		var ep = config.endpoints;
		jsonGettr(onLoad_routes, ep.baseurl + ep.routes);
		
		win1.open({fullscreen:false});
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

		var routesTable = tableviewAdder(data);

		// create table view event listener
		routesTable.addEventListener('click', function(e)
		{
			//win1.remove(activeTable);
			loadingWin.open();
			loadingWin.add(loadingMessage);
			
			curRoute = e.rowData;
			var ep = config.endpoints;
			var re = /{id}/gi;
			
			var endpoint = ep.baseurl + ep.stops.replace(re, curRoute.id);
			//win1.remove(activeTable);
			jsonGettr(onLoad_stops, endpoint);			
		});

		activeTable = routesTable;
		win1.add(activeTable);
	};

	var search = Titanium.UI.createSearchBar(
	{
		barColor:'#385292',
		showCancel:true,
		hintText:'Which bus are you taking?'
	});

	search.addEventListener('change', function(e)
	{
		e.value; // search string as user types
	});

	search.addEventListener('return', function(e)
	{
		search.blur();
	});
	
	search.addEventListener('cancel', function(e)
	{
		search.blur();
	});


	function tableviewAdder(data)
	{
		if(searchCtr == 1)
		{
			tableview = Titanium.UI.createTableView(
			{
				data:data
			});
		}
		else
		{
			searchCtr = 1;
			var tableview = Titanium.UI.createTableView({
			data:data,
			search:search,
			searchHidden:true
		});
		};
		
		return tableview;
	};
	
	function onLoad_stops()
	{
		var json = JSON.parse(this.responseText);
		var stops = json.items;
		
		for(var i = 0; i < json.items.length; i++)
		{
			var annotation = Titanium.Map.createAnnotation(
			{
			    latitude:stops[i].latitude,
			    longitude:stops[i].longitude,
			    title:stops[i].display_name,
			    subtitle:'Click here to see local events in the area!',
			    pincolor:Titanium.Map.ANNOTATION_RED,
			    animate:true,
			    leftButton: 'android/appicon.png',
			});
			
			stopsArray.push(annotation);
		}
		
		mapsWin.open();
		// mapsWin.mapViewr(stopsArray);
		mapsWin.stopsArray = stopsArray;
		mapsWin.fireEvent('mapViewr');
	};
	
	
	function onLoad_eventful()
	{
		var json = JSON.parse(this.responseText);
		
		// create table view data object
		var data = [];
		
		if(json.events == null){}
		
		var events = json.events['event'];

		if(events.length)
		{
			for(var i = 0; i < events.length; i++)
			{
				data.push({
					title: events[i].title
				});
			};
		}
		else
		{
			data.push({
				title: 'No events within 1 mile! SORRY.'
			});
		}
		
		var eventsTable = tableviewAdder(data);
		
		// create table view event listener
		eventsTable.addEventListener('click', function(e)
		{
			curEvent = e.rowData;
		});
		
		activeTable = eventsTable;
		
		//mapsWin.close();
		eventsWin.open();
		eventsWin.add(activeTable);
	};
	
	init();
})();