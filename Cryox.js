/* PACKAGES
    meteor add sergeyt:typeahead
    meteor add iron:router
 */

var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

if (Meteor.isClient) {
    Session.set('numFrozen', 42);

    /*
     * Start
     */

    Template.start.rendered = function() {
        Session.set('destination', 'The Nearest Facility');
    };

    Template.start.helpers({
        numFrozen: function() {
            return Session.get('numFrozen');
        }
    });

    /*
     * Today
     */

    Template.today.helpers({
        today: function() {
            return new Date();
        },
        today_month: function() {
            return MONTH_NAMES[new Date().getMonth()]
        }
    });

    /*
     * Progress
     */

    Template.progress.helpers({
        indicators: function() {
            var currentTemplate = Router.current().route.getName();
            var objects = [
                {name: "destination"},
                {name: "time"},
                {name: "review"},
                {name: "payment"},
                {name: "freeze"}
            ];
            objects.forEach( function(elem) {
                if (elem.name == currentTemplate) {
                    elem.active = "active";
                }
            });
            return objects;
        }
    });

    /*
     * Destination
     */

    Template.destination.rendered = function() {
        //if (Session.get('destination') == "The Nearest Facility") {
        //    $('.map').css('display', 'none');
        //}
        Meteor.typeahead.inject();
        GoogleMaps.load();
    };

    Template.destination.helpers({
        destination: function () {
            return Session.get('destination');
        },
        destinations: function() {
            return Destinations.find().fetch().map(function(it){ return it.name; });
        }
    });

    Template.destination.events({
        'keyup #dest': function(event) {
            var destinations = Destinations.find().fetch().map(function(it){ return it.name; });
            var value = event.currentTarget.value;
            if( value && $.inArray(value, destinations) == -1 ) {
                $(event.currentTarget).css('color', 'red').addClass('pulsate');
                $('.next').removeClass('pulsate').click(function(e) {e.preventDefault()});
            }
            else {
                $(event.currentTarget).css('color', '#cfe2f3').removeClass('pulsate');
                //$('.next').addClass('pulsate').unbind('click');  // moved to map click event
                Session.set("search", value);
                //$('.map').css('display', 'block');
                //GoogleMaps.load();
            }
        },
        'click .tt-selectable': function(event) {
            $('#dest').css('color', '#cfe2f3').removeClass('pulsate');
            //$('.next').addClass('pulsate').unbind('click');  // moved to map click event
            Session.set("search", event.currentTarget.innerText);
            //$('.map').css('display', 'block');
            //GoogleMaps.load();
        },
        'click .next' : function() {
            var dest_val = $('#dest').val();
            if (dest_val) {
                Session.set('destination', dest_val);
            }
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            Session.set('time', tomorrow);  // + (distance * C)
        }
    });

    /*
     * Map
     */

    Template.maps.onCreated(function(){
        var self = this;
        GoogleMaps.ready('map', function(map){
            console.log("Ready for action");
            var geocoder = new google.maps.Geocoder;
            var infowindow = new google.maps.InfoWindow;
            //poly place
            var placeId = "ChIJm2RXxMxawokRuUokmugSnTE"; //"ChIJ85aDTUpawokR95FkWT0xm9o";
            geocoder.geocode({'placeId': placeId}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        map.instance.setZoom(10);
                        map.instance.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            map: map.instance,
                            position: results[0].geometry.location
                        });
                        infowindow.setContent("<h2> Maimonides Medical Center Cryox Facility </h2>" +
                            "<p>" + results[0].formatted_address + "</p>" +
                            '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Tel:</div><div style="text-align: left" class="col span_1_of_2">66-66-6666</div></div>' +
                            '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Occupancy:</div><div style="text-align: left" class="col span_1_of_2">855/1050</div></div>' +
                            '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Distance:</div><div style="text-align: left" class="col span_1_of_2">10 miles</div></div>');
                        //infowindow.setContent("<div id=infowindow>"+results[0].formatted_address+"</div>");
                        infowindow.open(map.instance, marker);
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
                }
                //else {
                //    window.alert('Geocoder failed due to: ' + status);
                //}
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
                    }
                    //else {
                    //    window.alert('Geocoder failed due to: ' + status);
                    //}
                });
            }

            self.autorun(function() {
                var s = Session.get("search");
                var searchID = "";
                var facilities = [];
                var zoom = 12;
                var facilityName1 = "";
                var facilityName2 = "";
                var details1 = "";
                var details2 = "";
                if (s == "Australia"){
                    searchID = "ChIJs3u5LkiuEmsRnD4yjsR31dI";
                    facilities = ["ChIJadrb42quEmsRIOvv-Wh9AQ8", "ChIJ3S-JXmauEmsRUcIaWtf4MzE", "ChIJ24MzG_GwEmsRd2VLWl01368", "ChIJ2fGeq9SxEmsRwAd6A2l9AR0"];
                    zoom = 12;
                    facilityName1 = "<h2>Sydney International Airport Cryox Facility</h2>";
                    facilityName2 = "<h2>Sydney City Hospital Facility</h2>";
                    details1 = '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Tel:</div><div style="text-align: left" class="col span_1_of_2">02-90-6666</div></div>' +
                               '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Occupancy:</div><div style="text-align: left" class="col span_1_of_2">473/1000</div></div>' +
                               '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Distance:</div><div style="text-align: left" class="col span_1_of_2">30 miles</div></div>';
                    details2 = '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Tel:</div><div style="text-align: left" class="col span_1_of_2">02-90-2333</div></div>' +
                               '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Occupancy:</div><div style="text-align: left" class="col span_1_of_2">104/1000</div></div>' +
                               '<div class="section-group"><div style="text-align: right; font-weight: bold;" class="col span_1_of_2">Distance:</div><div style="text-align: left" class="col span_1_of_2">6 miles</div></div>';
                }
                // num all the facilities and search possible
                else if (s == "United Arab Emirates") {
                    searchID = "ChIJvRKrsd9IXj4RpwoIwFYv0zM";
                    facilities = ["ChIJ_0V2865cXz4RUL0f816Xf-I", "ChIJ2Y-H54FCXz4R2gdP3D5Mk24", "ChIJ73EMkN5IXj4RXnVtI3mZN5s", "ChIJ68MyYoddXj4R4SvuxX5y6BQ", "ChIJ9W6cOVxbXz4RnHgYkja5--E"];
                    zoom = 8;
                }
                else {
                    return;
                }
                //geocoder = new google.maps.Geocoder;
                //infowindow = new google.maps.InfoWindow;

                geocoder.geocode({'placeId': searchID}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            map.instance.setZoom(zoom);
                            map.instance.setCenter(results[0].geometry.location);
                            var marker = new google.maps.Marker({
                                icon: 'http://maps.google.com/mapfiles/ms/icons/ltblu-pushpin.png',
                                map: map.instance,
                                position: results[0].geometry.location
                            });
                            infowindow.setContent(results[0].formatted_address);
                            infowindow.open(map.instance, marker);
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
                    }
                    //else {
                    //    window.alert('Geocoder failed due to: ' + status);
                    //}
                });

                for (var i = facilities.length - 1; i >= 0; i--) {
                    geocoder.geocode({'placeId': facilities[i]}, function(results, status){
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                var marker = new google.maps.Marker({
                                    map: map.instance,
                                    position: results[0].geometry.location
                                });
                                google.maps.event.addListener(marker, 'click', (function (marker) {
                                    map.instance.setCenter(marker.getPosition());
                                    return function () {
                                        if (results[0].place_id == "ChIJ24MzG_GwEmsRd2VLWl01368") {
                                            infowindow.setContent(facilityName1 + "<p>" + results[0].formatted_address + "</p>" + details1);
                                        }
                                        else if (results[0].place_id == "ChIJ2fGeq9SxEmsRwAd6A2l9AR0") {
                                            infowindow.setContent(facilityName2 + "<p>" + results[0].formatted_address + "</p>" + details2);
                                        }
                                        else {
                                            infowindow.setContent(results[0].formatted_address);
                                        }
                                        infowindow.open(map.instance, marker);
                                    }
                                })(marker));
                            } else {
                                window.alert('No results found');
                            }
                        }
                        // else {
                        //    window.alert('Geocoder failed due to: ' + status);
                        //}
                    });
                }
                return;
            });
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

     	}
 	});

    Template.maps.events({
        "click .map": function() {
            var facilityName = $(".gm-style-iw").find("h2").text();
            if (facilityName == "Sydney International Airport Cryox Facility") {
                $('.next').addClass('pulsate').unbind('click');
            }
            else {
                $('.next').removeClass('pulsate').click(function(e) {e.preventDefault()});
            }
        }
    });

    /*
     * Time
     */

    Template.time.helpers({
        time : function() {
            return Session.get('time');
        },
        time_12hour : function() {
            return (new Date(Session.get('time')).getHours() + 11) % 12 + 1;
        }
    });

    Template.time.events({
        'keyup #hours': function(event) {
            //var val = parseInt(event.currentTarget.value);
            //if (val > 12 || val == 0)
            //    $('#meridiem').hide();
            //else
            //    $('#meridiem').show();
        },
        'click .next': function() {
            var month = $('#month').val();
            var date = $('#date').val();
            var year = $('#year').val();
            var hours = $('#hours').val();
            var am_pm = $('#am_pm').val();
            if (hours != 0 && hours < 12 && am_pm == "pm") {
                hours += 12;
            }
            else if (hours == 12 && am_pm == "am") {
                hours = 0;
            }
            Session.set('am_pm', am_pm);
            Session.set('time', new Date(year, month, date, hours, 0, 0));
        }
    });

    Template.time.rendered = function() {
        var date = new Date(Session.get('time'));
        $('#day').val(date.getDay());
        $('#month').val(date.getMonth());
        $('#am_pm').val(date.getHours() < 12 ? "am" : "pm");
        $('select').selectOrDie();
    };

    Template.time.destroyed = function() {
        $("select").selectOrDie("destroy");
    };

    /*
     * Review
     */

    Template.review.rendered = function() {
        Session.set('destination', 'Sydney International Airport Facility');
    };

    Template.review.helpers({
        destination: function() {
            return Session.get('destination');
        },
        time: function() {
            return Session.get('time');
        },
        time_12hour: function() {
            return (Session.get('time').getHours() + 11) % 12 + 1;
        },
        time_month: function() {
            return MONTH_NAMES[Session.get('time').getMonth()];
        },
        am_pm: function() {
            return Session.get('am_pm').toUpperCase();
        }
    });

    /*
     * Payment
     */

    Template.payment.rendered = function() {
        $('.next').removeClass('pulsate');
    };

    Template.payment.events({
        'click #img-scan' : function(event) {
            $(event.currentTarget).toggleClass('pulsate');
            $(event.currentTarget).toggleClass('faded');
            $('#accepted').toggle();
            $('.prev').toggle();
            setTimeout(function() { Router.go('freeze'); }, 2000); // 2 seconds
        }
    });

    /*
     * Freeze
     */

    Template.freeze.rendered = function() {
        Session.set('countdown', 60);
        this.timer = Meteor.setInterval(countdown, 1000);
        Session.set('numFrozen', Session.get('numFrozen') + 1);
    };

    Template.freeze.destroyed = function() {
        Meteor.clearInterval(this.timer);
    };

    Template.freeze.helpers({
        seconds: function() {
            return Session.get('countdown');
        }
    });

    /*
     * Ticket
     */

    Template.ticket.rendered = function() {
        Session.set('countdown', 60);
        this.timer = Meteor.setInterval(countdown, 1000);
        Session.set('numFrozen', Session.get('numFrozen') + 1);
    };

    Template.ticket.destroyed = function() {
        Meteor.clearInterval(this.timer);
    };

    Template.ticket.helpers({
        seconds: function() {
            return Session.get('countdown');
        }
    });
}

var countdown = function() {
    var current = Session.get('countdown');
    if (current == 0) {
        current = 61;
    }
    Session.set('countdown', --current);
};

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
Router.route('/payment');
Router.route('/freeze');
// manual (no link)
Router.route('/ticket');
Router.route('/cop');
