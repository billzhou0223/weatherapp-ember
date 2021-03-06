import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
	this.resource('city', {path: '/city/:city_id'});
	this.route('add');
});

export default Router;
