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
        Session.set('destination', 'Nearest Facility');
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
        Meteor.typeahead.inject();
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
                $(event.currentTarget).css('color', 'red');
                $('.next').removeClass('pulsate').click(function(e) {e.preventDefault()});
            }
            else {
                $(event.currentTarget).css('color', '#cfe2f3');
                $('.next').addClass('pulsate').unbind('click');
            }
        },
        'click .tt-selectable': function(event) {
            $('#dest').css('color', '#cfe2f3');
            $('.next').addClass('pulsate').unbind('click');
            //console.log(event.currentTarget.innerText);
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
            $('.next').toggleClass('pulsate');
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
