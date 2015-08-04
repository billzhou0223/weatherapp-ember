import Ember from 'ember';

var ApplicationRoute = Ember.Route.extend({
	actions: {
		// Toggle units action
		toggleUnits: function() {
			var useUSUnits = this.controllerFor('index').get('useUSUnits');
			    // useUSUnits = this.get('indexController.useUSUnits');
			    
	    // Ember.set(indexController, 'useUSUnits', !useUSUnits);
	    // controller.useUSUnits = !useUSUnits;
			this.controllerFor('index').set('useUSUnits', !useUSUnits);
			// alert(this.controllerFor('index').get('useUSUnits'));
			this.controllerFor('index').syncLocalStorage();
		},
	},

});

export default ApplicationRoute;

