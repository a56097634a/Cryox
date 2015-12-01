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
