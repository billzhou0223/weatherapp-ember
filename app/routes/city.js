import Ember from 'ember';

var CityRoute = Ember.Route.extend({
	controllerName: 'eachcity',

	model: function(params) {
		var cities = this.controllerFor('index').get('cities'),
		 		id     = params.city_id;

		for(var i = 0; i < cities.length; ++i) {
			if(cities[i].id === id) {
				return cities[i];
			}
		}
	}
});

export default CityRoute;