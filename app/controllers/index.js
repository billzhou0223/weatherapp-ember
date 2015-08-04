import Ember from 'ember';

var IndexController = Ember.ArrayController.extend({
	// itemController: 'eachcity',

	config: {

    // The API base URL self will be used. 
    weatherAPIBaseURL:   'https://api.forecast.io/forecast/',
    
    // The API key. Replace with your own.
    weatherAPIKey: '0dcfddff766642799f1f15280394bebc',

    // The key for the current location self will be kept in the data. It is special so it is defined here.
    currentLocationKey: 'currentlocation'
  },

  cities: [
  {
  	id: 'sanjose',
  	name: 'San Jose',
  	lat: 37.3382082,
  	lng: -121.88632860000001,
  	lastUpdated: -1,
  	weatherData: null
  },
  {
  	id: 'sydney',
  	name: 'Sydney',
  	lat: -33.8674869,
  	lng: 151.20699020000006,
  	lastUpdated: -1,
  	weatherData: null
  }
  ],

	useUSUnits: true,

	// The data is set to refresh every 10 minutes or 600,000 milliseconds.
  dataRefreshInterval: 600000,

  // The display time updates every 5 seconds or 5,000 milliseconds.
  timeUpdateInterval: 5000,

  isEditing: false,

  // button action handler
  actions: {
    edit: function() {
      var isEditing = this.get('isEditing');
      this.set('isEditing', !isEditing);
    },

    deleteCity: function(id) {
      var cities = this.get('cities');
      for(var i = 0; i < this.get('cities.length'); ++i) {
        if(cities[i].id === id) {
          cities.removeObject(cities[i]);
          break;
        }
      }
      this.syncLocalStorage();
    },

    done: function() {
      var isEditing = this.get('isEditing');
      this.set('isEditing', !isEditing);
    }
  },

  //disable link
  isNotEditing: function() {
    var isEditing = this.get('isEditing');
    return !isEditing;
  }.property('isEditing'),

  newCityadded: function() {
    this.updateDataForCitiesList();
    this.syncLocalStorage();
  }.observes('cities.length'),

	loadDataFromLocalStorage: function() {
  	var localStorageCities = JSON.parse(localStorage.getItem("cities"));
  	if(localStorageCities) {
  		// this.cities = localStorageCities;
  		this.set('cities', localStorageCities);
  	}
  	// this.useUSUnits = JSON.parse(localStorage.getItem("useUSUnits"));
  	this.set('useUSUnits', JSON.parse(localStorage.getItem("useUSUnits")));
  	if(this.get('useUSUnits') === null || this.get('useUSUnits') === undefined) {
  		// this.useUSUnits = true;
  		this.set('useUSUnits', true);
  	}
  },

  // Save back to local storage.
  syncLocalStorage: function() {
  	// localStorage.setItem("cities", JSON.stringify(this.cities));
  	// localStorage.setItem("useUSUnits", JSON.stringify(this.useUSUnits));
  	localStorage.setItem("cities", JSON.stringify(this.get('cities')));
  	localStorage.setItem("useUSUnits", JSON.stringify(this.get('useUSUnits')));
  },

  // Return for a given id, the city
  cityDataForId: function(id) {
  	var cities = this.get('cities');
  	for(var i=0, iLen=cities.length; i<iLen; i++) {
  		if(cities[i].id === id) {
  			return cities[i];
  		}
  	}
  	return null;
  },

  updateDataForCitiesList: function() {
    var cities = this.get('cities');
        
    if(cities.length) {
      for(var i=0; i<cities.length; i++) {
        
        // If it is the last one in the list, pass true into getWeatherDataForCityId
        this.getWeatherDataForCityId(cities[i]);
      }
    }
  },

  getWeatherDataForCityId: function(city) {

    // If this is called within the refresh interval, then just bail here.
    if (!city || (new Date().getTime() - this.dataRefreshInterval) < city.lastUpdated) {
    	return;
    }
    	
    var self = this;
    
    // Always return with SI units. Conversion to imperial/US can be done on the client side.
    // However, doing it with the API is just fine as well.
    Ember.$.ajax({
      url: self.get('config.weatherAPIBaseURL') + self.get('config.weatherAPIKey') + '/'+ city.lat +","+city.lng+"?units=si",
      method: 'GET',
      crossDomian: true,
      dataType: 'jsonp'
    }).done(function(result){
    	// city.weatherData = result;
      if(result){
        Ember.set(city, 'weatherData', result);
        city.lastUpdated = new Date().getTime();
        self.syncLocalStorage();
      }else{
        var error = city.name + 'failed to load weather data';
        alert(error);
        this.get('cities').removeObject(city);
      }
    });
  },

	fetchCurrentLocation: function() {
		var self = this;

  	if (navigator.geolocation) {

		// If current location is updated, then add the current location to the 
	  // cities array if needed at the top of the list.
	  var currentLocationWasUpdated = function(position) {
	  	// var city = self.cityDataForId(self.get('config').get('currentLocationKey')),
	  	var city = self.cityDataForId(self.get('config.currentLocationKey')),
			  	shouldPush = false;

	    // If the current location does not exist in the cities array,
	    // create a new city.
	    if(!city) {
	    	city = {};
	    	shouldPush = true;
	    	city.weatherData = null;
	    	// city.set('weatherData', 'null');
	    } 
	    
	    // Either way, set the location information.
	    // city.id   = self.get('config.currentLocationKey');
      Ember.set(city, 'id', self.get('config.currentLocationKey'));
	    // city.name = 'Current Location';
	    Ember.set(city, 'name', 'Current Location');
	    city.lat  = position.coords.latitude;
	    city.lng  = position.coords.longitude;
	    
	    // Only push onto the array if it does not exist already.
	    if (shouldPush) {
	    	// self.get('cities').unshift(city);
	    	self.get('cities').unshiftObject(city);
	    }
	    
	    self.updateDataForCitiesList();
	    self.syncLocalStorage();
	  };

	  // If current location is denied, then just remove it from the list.
	  var currentLocationWasDenied = function() {
	  	var cities = self.get('cities'),
	  	    city   = self.cityDataForId(self.get('config.currentLocationKey'));
	  	if (city) {
	  		cities.splice(cities.indexOf(city), 1);
	  	}
	  	self.syncLocalStorage();
	  };

		navigator.geolocation.getCurrentPosition(currentLocationWasUpdated, currentLocationWasDenied);  
		}
	},

  init: function() {
  	this._super();
  	this.fetchCurrentLocation();
  	this.loadDataFromLocalStorage();

    // update time 
    var self = this;
    var startTimer = function() {
      Ember.run.later((function() {
      self.updateDataForCitiesList();
      startTimer();
      }), self.timeUpdateInterval);
    };
    startTimer();

  }
	
});

export default IndexController;