/* PACKAGES
    meteor add sergeyt:typeahead
    meteor add iron:router
 */

if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);

    /*
     * Start
     */

    // set all back to default
    Template.start.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });

    Template.start.events({
        'click button': function () {
            // increment the counter when button is clicked
            Session.set('counter', Session.get('counter') + 1);
        }
    });


    /*
     * Destination
     */

    Template.destination.rendered = function() {
        Meteor.typeahead.inject();
        GoogleMaps.load();
    };

    Template.destination.helpers({
        counter: function () {
            return Session.get('counter');
        },
        destinations: function() {
            return Destinations.find().fetch().map(function(it){ return it.name; });
        }
    });

    Template.destination.events({
        'click button': function () {
            // decrement the counter when button is clicked
            Session.set('counter', Session.get('counter') - 1);
        },
        'click #dest': function(event){
        	var value = event.currentTarget.value
        	console.log('abc');
        	Session.set('search', value);
        }
    });

    /*
     * Map
     */

     Template.maps.onCreated(function(){
        GoogleMaps.ready('map', function(map){
            console.log("Ready for action");
            var geocoder = new google.maps.Geocoder;
            var infowindow = new google.maps.InfoWindow;
            //poly place
            var placeId = "ChIJ85aDTUpawokR95FkWT0xm9o";
            geocoder.geocode({'placeId': placeId}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        map.instance.setZoom(10);
                        map.instance.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            map: map.instance,
                            position: results[0].geometry.location
                        });
                        infowindow.setContent("<div id=infowindow>"+results[0].formatted_address+"</div>");
                        infowindow.open(map, marker);
                        google.maps.event.addListener(marker, 'click', (function(marker) {
                            	map.instance.setCenter(marker.getPosition());
    							return function(){
    								infowindow.setContent(results[0].formatted_address);
    								infowindow.open(map.instance, marker);
    							}
  						})(marker)); 
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
            
            var facilities = ["ChIJmQJIxlVYwokRLgeuocVOGVU", "ChIJR0lA1VBmwokR8BGfSBOyT-w", "ChIJxYx4g8pFwokRxOWbtEQbr3o", "ChIJm2RXxMxawokRuUokmugSnTE"];
            for (var i = facilities.length - 1; i >= 0; i--) {
                geocoder.geocode({'placeId': facilities[i]}, function(results, status){
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            var marker = new google.maps.Marker({
                                map: map.instance,
                                position: results[0].geometry.location
                            });
                            google.maps.event.addListener(marker, 'click', (function(marker) {
                            	map.instance.setCenter(marker.getPosition());
    							return function(){
    								infowindow.setContent(results[0].formatted_address);
    								infowindow.open(map.instance, marker);
    							}
  							})(marker)); 
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            }
        });
    });

     Template.maps.helpers({
     	mapOptions: function(){
     		if (GoogleMaps.loaded()) {
      			return {
        			center: {lat: 40.72, lng: -73.96},
        			zoom: 8
      			};
    		}
     	},
     	search: function(){
     		var s = Session.get('search');
     		var searchID = "";
     		var facilities = [];

     		if (s == "Google Sydney, Darling Island Road, Pyrmont, New South Wales, Australia"){
     			searchID = "ChIJs3u5LkiuEmsRnD4yjsR31dI";
     			facilities = ["ChIJadrb42quEmsRIOvv-Wh9AQ8", "ChIJ3S-JXmauEmsRUcIaWtf4MzE", "ChIJ24MzG_GwEmsRd2VLWl01368", "ChIJ2fGeq9SxEmsRwAd6A2l9AR0"];
     		}
     		// num all the facilities and search possible
     		else{
     			return
     		}

     		GoogleMaps.ready('map', function(map){
          		console.log("Ready for search");
          		var geocoder = new google.maps.Geocoder;
            	var infowindow = new google.maps.InfoWindow;

            	geocoder.geocode({'placeId': searchID}, function(results, status) {
                	if (status === google.maps.GeocoderStatus.OK) {
                    	if (results[0]) {
                        	map.instance.setZoom(10);
                        	map.instance.setCenter(results[0].geometry.location);
                        	var marker = new google.maps.Marker({
                            	icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            	map: map.instance,
                            	position: results[0].geometry.location
                        	});
                        	infowindow.setContent("<div id=infowindow>"+results[0].formatted_address+"</div>");
                        	infowindow.open(map, marker);
                        	google.maps.event.addListener(marker, 'click', (function(marker) {
                            	map.instance.setCenter(marker.getPosition());
    							return function(){
    								infowindow.setContent(results[0].formatted_address);
    								infowindow.open(map.instance, marker);
    							}
  							})(marker)); 
                    	} else {
                        	window.alert('No results found');
                    	}
                	} else {
                    	window.alert('Geocoder failed due to: ' + status);
                	}
            	});

				for (var i = facilities.length - 1; i >= 0; i--) {
                geocoder.geocode({'placeId': facilities[i]}, function(results, status){
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            var marker = new google.maps.Marker({
                                map: map.instance,
                                position: results[0].geometry.location
                            });
                            google.maps.event.addListener(marker, 'click', (function(marker) {
                            	map.instance.setCenter(marker.getPosition());
    							return function(){
    								infowindow.setContent(results[0].formatted_address);
    								infowindow.open(map.instance, marker);
    							}
  							})(marker)); 
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            }

    	});

     	}
 	});

     Template.maps.events({
     	'click': function(){

     	}
     });

    /*
     * Progress
     */

    Template.progress.helpers({
        indicators: function() {
            var currentTemplate = Router.current().route.getName();
            var objects = [
                {name: "DESTINATION"},
                {name: "TIME"},
                {name: "REVIEW"},
                {name: "PAYMET"},
                {name: "FREEZE"}
            ];
            objects.forEach( function(elem) {
                if (elem.name.toLowerCase() == currentTemplate) {
                    elem.active = "active";
                }
            });
            return objects;
        }
    });
}


Destinations = new Meteor.Collection("destinations");

if (Meteor.isServer){
    Meteor.startup(function () {
        function fill(col, source, map){
            col.remove({});
            JSON.parse(Assets.getText(source)).forEach(function(it){
                col.insert(typeof map === 'function' ? map(it) : it);
            });
        }

        Destinations.remove({});
        fill(Destinations, 'destinations.json', function(name){ return {name: name}; });
    });
}


/*
 * Router
 */

Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', {name: 'start'});
Router.route('/destination');
Router.route('/time');
Router.route('/review');
