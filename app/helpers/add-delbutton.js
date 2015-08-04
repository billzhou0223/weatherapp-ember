import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(value) {
	if(value !== 'currentlocation'){
  	var html = [
  		'<li class = "delete-button">−</li>'
  	].join('');

  	return html.htmlSafe();
  }
  return;
});