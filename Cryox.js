/* PACKAGES
    meteor add sergeyt:typeahead
    meteor add iron:router
 */
Dest = new Mongo.Collection("dests");


if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('destinationshow', "abc");
    Session.setDefault('timeline', "123");

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
        /*dests: function (event) {
            var text = event.target.dest.value;
            Session.set('destination', text);
          //return Dest.find({});
          //return Session.get('destination');
        },*/
        
        destinations: function() {
            //Session.set('destinationshow', "text");
           return Destinations.find().fetch().map(function(it){ return it.name; });
        }
    });

    Template.destination.events({
        /*"click .nav prev": function (event, template) {
            //alert("My button was clicked!");
        },*/
     'input #dest': function (event) {
            //event.preventDefault();
            var text = event.currentTarget.value;
            console.log("text");
            Session.set('destinationshow', "text");
          //return Dest.find({});
          //return Session.get('destination');
        }
       /* "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var text = event.target.dest.value;
 
      // Insert a task into the collection
      Dest.insert({
        text: dest,
        createdAt: new Date() // current time
      });
 
      // Clear form
      //event.target.dest.value = "";
    }*/
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


    /*
     * review
     */


    Template.review.helpers({
     destshow: function () {
      // Show newest tasks at the top
      //Session.set('destinationshow', "text");
      return Session.get('destinationshow');
    }

    });

    Template.review.events({
      
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
