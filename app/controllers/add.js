import Ember from 'ember';

var AddController = Ember.ArrayController.extend({
	queryParams: ['query'],
  query: null,

  needs: 'index',

  actions: {
  	addcity: function(data) {
  		var city = {},
  				name = isNaN(parseInt(data.displayName)) ? 
                    data.displayName : data.formatted_address.split(',')[0],
  				id = this.getIdFromName(name);

			if(this.get('controllers.index').cityDataForId(id) === null){
				Ember.set(city, 'id', id);
				Ember.set(city, 'name', name);
				Ember.set(city, 'lat', data.lat);
				Ember.set(city, 'lng', data.lng);
				Ember.set(city, 'lastUpdated', -1);
				Ember.set(city, 'weatherData', null);

				this.get('controllers.index.cities').pushObject(city);
				this.set('query', null);
				this.transitionToRoute('index');
			}
  	},

  	cancel: function() {
  		this.set('query', null);
  		this.transitionToRoute('index');
  	} 
  },

  getIdFromName: function(name) {
  	var id = name.replace(/\s/g,'').toLowerCase();
  	return id;
  }
});

export default AddController;