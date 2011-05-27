function onLoad_eventful()
	{
		var json = JSON.parse(this.responseText);
		
		// create table view data object
		var data = [];
		var events = json.events['event'];
		
		if(events.length)
		{
			for(var i = 0; i < events.length; i++)
			{
				data.push({
					title: events[i].title
					// latitude: events[i].latitude,
					// longitude: events[i].longitude
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
		
		//win2.close();
		eventsWin.open();
		eventsWin.add(activeTable);
	};