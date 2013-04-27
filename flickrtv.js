	// Hardcoded channels - yeah
	
	carouselItemCount = 0
	
	channels = ["cbbG", "cbbh", "cbdw", "cbdj", "cbdq", "cbdZ"]
	$.each(channels, function(i, item){
			// What's on?
			$.getJSON("http://users.atlas.metabroadcast.com/3.0/schedule.json?channel_id=" + item + "&annotations=channel,channel_summary,description,brand_summary,broadcasts,series_summary,available_locations&from=2013-04-28T11:13:00.000Z&to=2013-04-28T15:30:00.000Z&apiKey=84097c4de516445eb7bb58f4b73d2842&callback=?").done(function( data ) {

				channel = data.schedule[0].channel	

				console.log("checking:" + channel.title)
				$.each(data.schedule[0].items, function(i,item){
					if (item.container) {
						item.displayTitle = item.container.title;
					} else {
						item.displayTitle = item.title;
					}
					console.log("searching for: " + item.displayTitle);
					searchFlickr(item.displayTitle, channel, item)
				});
	});
});


	
	
	function searchFlickr(searchTerm, channel, episode) {
			$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=437d632b5040abd36208805b26c76e57&format=json&per_page=30&text=%22" + searchTerm + "%22&sort=interestingness-desc&jsoncallback=?").done(function(data) {
				$.each(data.photos.photo, function(i, item) {
					$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=437d632b5040abd36208805b26c76e57&original_format=1&photo_id=" + item.id + "&format=json&jsoncallback=?", function(data) {
						considerImage(data, channel, episode)
					});

				});
			});
	}

			
	function considerImage(data, channel, episode) {
		id = data.photo.id 
		title = data.photo.title._content
		author = data.photo.owner.path_alias
		views = data.photo.views
		comments = data.photo.comments._content
		url_base = "http://farm" + data.photo.farm + ".staticflickr.com/" + data.photo.server + "/" + id + "_" + data.photo.secret
		url_original =  url_base + "_o.png"
		url_medium =  url_base + "_m.jpg"
		page_url = data.photo.urls.url[0]._content

		console.log("considering: " + title);
		console.log("for: " + episode.displayTitle + " on " + channel.title);
		console.log(id);		
		console.log(url_medium);		
		console.log(page_url);		
		console.log("views: " + views);
		if (views < 500) {
			console.log("too few views")
			return
		} 		
		console.log("comments: " + comments);		
		if (comments < 10) {
			console.log("too few comments")
			return
		} 		
		console.log("WINNER!")
		
		  $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=437d632b5040abd36208805b26c76e57&photo_id=" + id + "&format=json&jsoncallback=?")
		  .done(function( data ) {
		    $.each( data.sizes.size, function( i, item ) {
				//console.log("found image: " + item.label);
		      if ( item.label == "Large") {
				if (carouselItemCount == 0) { // set active flag on 1st entry only
					active = " active"
				} else {
					active = ""
				}
				
				if (carouselItemCount < 30) {
					$('#images').append("<div class='item" + active + "'><img height=600 src='" + item.source + "'/><div class='carousel-caption'><h4><img class='logo' height=28 width=50 src='http://users.images.atlas.metabroadcast.com/?source=" + channel.image + "'>" + episode.displayTitle + "</h4><p class='lead'>" + episode.description + "</p><p><small>" + title + "by <a href='" + page_url + "'>@" + author  + "</a></small></p></div></div>")
				carouselItemCount++
				}			
		      }

		    });
		  });				
	}

