import Ember from 'ember';

var AddRoute = Ember.Route.extend({
	queryParams: {
    query: {
      refreshModel: true
      // replace: true
    }
  },

  model: function(params) {
    return Ember.$.ajax({
      url: 'http://coen268.peterbergstrom.com/locationautocomplete.php',
      method: 'GET',
      crossDomian: true,
      dataType: 'jsonp',
      data: params ? params : null
    }).then(function(result) {
      return result;
    });
  },
});

export default AddRoute;