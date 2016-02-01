import Ember from 'ember';

var EachCityController = Ember.ObjectController.extend({
  needs: 'index',

	showMinutes: true,

  isNotCurrentLocation: function() {
    if(this.get('id') === 'currentlocation'){
      return false;
    }
    return true;
  }.property('id'),

  shiftRight: function() {
    var isEditing = this.get('controllers.index.isEditing'),
        id        = this.get('id');

    if(isEditing && id !== 'currentlocation') {
      return true;
    }
    return false;
  }.property('controllers.index.isEditing'),

	currentLocalDate: function() {
		var time = this.get('weatherData.currently.time'),
		    offset = this.get('weatherData.offset'),
		    lastUpdated = this.get('lastUpdated'),
		    timeOffsetSinceLastRefresh = new Date().getTime() - lastUpdated,
		    date  = new Date(time * 1000 + timeOffsetSinceLastRefresh),
		    utc   = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());

		utc.setHours(utc.getHours() + offset);
		return utc;
	}.property('weatherData.currently.time', 'weatherData.offset', 'lastUpdated'),

	currentTime: function() {
    var date     = this.get('currentLocalDate'),
        hours    = date.getHours(),
        meridian = 'AM';
    
    if(hours >= 12) {
      if(hours > 12) {
        hours -= 12;
      }
      meridian = 'PM';
    }
    
    if (hours === 0) {
      hours = 12;
    }
    
    if(this.showMinutes) {
      var minutes = date.getMinutes();
      if(minutes < 10) {
        minutes = '0'+minutes;
      }
      
      return hours + ':' + minutes + ' ' + meridian;
    }
    return hours + ' ' + meridian;
  }.property('currentLocalDate'),

  currentTemperature: function() {
    // If using US units, then convert from Celsius.
    // See: http://fahrenheittocelsius.com
    var temp = this.get('weatherData.hourly.data.0.temperature'),
        useUSUnits = this.get('controllers.index.useUSUnits');

    return Math.round(useUSUnits ?  (temp * 9/5 + 32) : temp) +"˚";
  }.property('controllers.index.useUSUnits', 'weatherData.hourly.data.0.temperature'),

  conditionClassname: function() {
    var data = this.get('weatherData'),
        classNames = '';

    if(data) {
      var conditionsNow = data.hourly.data[0];
          // date          = new Date(conditionsNow.time * 1000);
          
      // It is day if you're between sunrise and sunset. Then add the is-day class. Otherwise, add is-night
      if(conditionsNow.time >= data.daily.data[0].sunriseTime && conditionsNow.time <= data.daily.data[0].sunsetTime) {
        classNames += 'is-day ';
      } else {
        classNames += 'is-night ';
      }

      // If the icon name includes cloudy OR there is a cloudCover above 0.2, make it cloudy.
      // The 0.2 is completely arbitary.
      if(conditionsNow.icon.indexOf('cloudy') !== -1 || conditionsNow.cloudCover > 0.2) {
        classNames += 'is-cloudy ';
      }
    }
    return classNames;
  }.property('weatherData'),

  /**********************************************************************************/
  /********************************selected city header******************************/
  /**********************************************************************************/
  summary: function() {
    var summary = this.get('weatherData.hourly.data.0.summary');
    return summary;
  }.property('weatherData.hourly.data.0.summary'),

  /**********************************************************************************/
  /********************************Selected City *Today******************************/
  /**********************************************************************************/

  updateSelectedCityTodayOverview: function() {
    var localDate  = this.get('currentLocalDate'),
    diff           = Math.round((localDate.getTime() - new Date().getTime())/(24*3600*1000)),
    relativeDate   = 'Today';
    if(diff < 0) {
      relativeDate = 'Yesterday';
    } else if(diff > 0) {
      relativeDate = 'Tomorrow';
    }
    
    // var weatherData = this.get('weatherData');
    
    var html = [
        '<li>', 
          this.weekDayForDate(localDate),
        '</li>',
        '<li>', 
          relativeDate,
        '</li>',
        '<li>', 
          this.formatTemperature(this.get('weatherData.daily.data.0.temperatureMax')), 
        '</li>',
        '<li>', 
          this.formatTemperature(this.get('weatherData.daily.data.0.temperatureMin')),
        '</li>'].join('');

    return html.htmlSafe();

  }.property('model', 'controllers.index.useUSUnits'),


  updateSelectedCityHourlyForecast: function() {
    if (this.get('weatherData.hourly')) {
      var hourlyForecastHTML   = '',
          hourlyForecastData   = this.get('weatherData.hourly.data'),
          hourlyForecastLength = Math.min(hourlyForecastData.length, 24);
          
       for(var i = 0; i < hourlyForecastLength; i++) {
         var hourlyForecastForHour = hourlyForecastData[i],
             hourlyForecastDate    = this.getLocalDate(hourlyForecastForHour.time, this.get('weatherData.offset'));

         var hoursString = i == 0 ? 'Now' :  this.formatTime(hourlyForecastDate, false);
         hourlyForecastHTML += [
         '<li>',
           '<ul>',
             '<li>', 
                hoursString ,
              '</li>',
              '<li>', 
                '<img src="assets/images/'+hourlyForecastForHour.icon + '.png', '">', 
              '</li>',
              '<li>',
                this.formatTemperature(hourlyForecastForHour.temperature), 
              '</li>',
           '</ul>',
          '</li>'
         ].join('');
       }

       return hourlyForecastHTML.htmlSafe();

     }
  }.property('model', 'controllers.index.useUSUnits'),

  hourlyForecastLength: function() {
    var hourlyForecastData   = this.get('weatherData.hourly.data'),
        hourlyForecastLength = Math.min(hourlyForecastData.length, 24);

    return 'width: ' + (hourlyForecastLength * 64) + 'px';
  }.property('weatherData.hourly.data'),

  weekDayForDate: function(date) {
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][date.getDay()];
  },

  getLocalDate: function(time, timezoneOffset, timeOffsetSinceLastRefresh) {
    timeOffsetSinceLastRefresh = timeOffsetSinceLastRefresh ? timeOffsetSinceLastRefresh : 0;
    var date  = new Date(time * 1000 + timeOffsetSinceLastRefresh);
    var utc   = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
    
    utc.setHours(utc.getHours() + timezoneOffset);
    return utc;
  },

  /**********************************************************************************/
  /********************************Selected City Forecast****************************/
  /**********************************************************************************/
  updateSelectedCityForecast: function() {
    var sevenDayForecast = '',
        city = this.get('model');

    if (city.weatherData.daily) {
      var dailyForecastData = this.get('weatherData.daily.data');
      for(var i = 1, iLen=dailyForecastData.length; i < iLen; i++) {
        var dailyForecast     = dailyForecastData[i],
            dailyForecastDate = this.getLocalDate(dailyForecast.time, city.weatherData.offset);
        sevenDayForecast += [
          '<li>',
            '<ul>',
              '<li>', 
                this.weekDayForDate(dailyForecastDate), 
              '</li>',
              '<li>', 
                '<img src="'+'assets/images/'+dailyForecast.icon + '.png', '">', 
              '</li>',
              '<li>',
                this.formatTemperature(dailyForecast.temperatureMax), 
              '</li>',
              '<li>', 
                this.formatTemperature(dailyForecast.temperatureMin), 
                '</li>',
            '</ul>',
          '</li>'].join('');
      }
    }
    return sevenDayForecast.htmlSafe();
  }.property('model', 'controllers.index.useUSUnits'),

  /**********************************************************************************/
  /***************************Selected City Today Details****************************/
  /**********************************************************************************/
  updateSelectedCityTodayDetailsSummary: function() {
    var summary = "Today: " + this.get('weatherData.daily.summary');
    return summary;
  }.property('weatherData.daily.summary'),

  updateSelectedCityTodayDetailsStatistics: function() {
    var weatherData       = this.get('weatherData'),
        currentConditions = this.get('weatherData.hourly.data.0'),
        todayDetailsHTML  = '',
        todayDetailsData  = [
          {
            label:'Sunrise:',
            value: this.formatTime(this.getLocalDate(weatherData.daily.data[0].sunriseTime, weatherData.offset), true)
          },
          {
            label:'Sunset:',
            value: this.formatTime(this.getLocalDate(weatherData.daily.data[0].sunsetTime, weatherData.offset), true)
          },
          {
            label: '',
            value: '',
          },
          {
            label: currentConditions.precipType === 'snow' ? 'Chance of Snow:' : 'Chance of Rain:',
            value: this.formatPercentage(currentConditions.precipProbability)
          },
          {
            label: 'Humidity:',
            value: this.formatPercentage(currentConditions.humidity)
          },
          {
            label: '',
            value: '',
          },
          {
            label: 'Wind:',
            value: this.formatWind(currentConditions)
          },
          {
            label: 'Feels like:',
            value: this.formatTemperature(currentConditions.apparentTemperature),
          },
          {
            label: '',
            value: '',
          },
          {
            label: 'Precipitation:',
            value: this.formatPrecipitation(currentConditions.precipIntensity)
          },
          {
            label: 'Pressure:',
            value: this.formatPressureFromHPA(currentConditions.pressure)
          },
          {
            label: '',
            value: '',
          },
          {
            label: 'Visibility:',
            value: this.formatVisibilty(currentConditions.visibility),
          }
        ];

    for(var i = 0; i < todayDetailsData.length; i++) {
      todayDetailsHTML += [
        '<li>',
          '<ul>',
            '<li>', 
              todayDetailsData[i].label, 
            '</li>',
            '<li>', 
              todayDetailsData[i].value, 
            '</li>',
          '</ul>',
        '</li>'].join('');
    }

    return todayDetailsHTML.htmlSafe();
  }.property('weatherData', 'controllers.index.useUSUnits'),

  /**********************************************************************************/
  /***************************Selected City Nav**************************************/
  /**********************************************************************************/
  isSelectedCityFirst: function() {
    var cities = this.get('controllers.index.cities'),
        id     = this.get('id'),
        selectedCityIndex = 0;

    for(var i=0, iLen=cities.length; i<iLen; i++) {
      if(cities[i].id === id) {
        selectedCityIndex = i;
        break;
      }
    }

    if(selectedCityIndex === 0){
      return true;
    }
    return false;
  }.property('model'),

  isSelectedCityLast: function() {
    var cities = this.get('controllers.index.cities'),
        id     = this.get('id'),
        selectedCityIndex = 0;

    for(var i=0, iLen=cities.length; i<iLen; i++) {
      if(cities[i].id === id) {
        selectedCityIndex = i;
        break;
      }
    }

    if(selectedCityIndex === cities.length - 1){
      return true;
    }
    return false;
  }.property('model'),

  previousCity: function() {
    var cities = this.get('controllers.index.cities'),
        id     = this.get('id'),
        selectedCityIndex = 0;

    for(var i=0, iLen=cities.length; i<iLen; i++) {
      if(cities[i].id === id) {
        selectedCityIndex = i;
        break;
      }
    }
    var previousIndex = (selectedCityIndex == 0) ? selectedCityIndex : (selectedCityIndex-1);

    return cities[previousIndex];
  }.property('model'),

  nextCity: function() {
    var cities = this.get('controllers.index.cities'),
        id     = this.get('id'),
        selectedCityIndex = 0;

    for(var i=0, iLen=cities.length; i<iLen; i++) {
      if(cities[i].id === id) {
        selectedCityIndex = i;
        break;
      }
    }
    var nextIndex = (selectedCityIndex == cities.length-1) ? selectedCityIndex : (selectedCityIndex+1);

    return cities[nextIndex];
  }.property('model'),

  renderNavDot: function() {
    var id                = this.get('id'),
        cities            = this.get('controllers.index.cities'),
        navHTML           = '';

    
      
    if (cities.length >= 1) {     
      navHTML += '<div class="indicator-dots">';
    
      for(var i=0, iLen=cities.length; i<iLen; i++) {
        navHTML += [
          '<span class="dot', (cities[i].id === id) ? ' current': '', '">',
            '•',
          '</span>'].join('');
      }
      navHTML += '</div>';
    }

    return navHTML.htmlSafe();
  }.property('model'),

  /**********************************************************************************/
  /***************************format methods****************************/
  /**********************************************************************************/
  formatVisibilty: function(visibility) {
    
    // If using US units, convert to miles.
    if(visibility){
      var useUSUnits = this.get('controllers.index.useUSUnits'),
          distance   = (useUSUnits ? visibility * 0.621371 : visibility).toFixed(1);

      return distance + ((useUSUnits) ? ' mi' : ' km');
    }
    return '--';
  },
  
  formatPrecipitation: function(precipitation) {
    if(precipitation == 0) {
      return '--';
    }
    
    // If using US units, convert from mm to inches.
    var useUSUnits = this.get('controllers.index.useUSUnits'),
        amount      = ((useUSUnits) ? (precipitation * 0.0393701).toFixed(2) : precipitation);
    
    return amount + ((useUSUnits) ? ' in' : ' mm');
  },
  
  formatPressureFromHPA: function(pressure) {
    var useUSUnits = this.get('controllers.index.useUSUnits');
    // If using US units, convert to inches.
    if(useUSUnits) {
      return ((pressure*0.000295299830714*100).toFixed(2)) + " in";
    }
    
    return (pressure).toFixed(2) + ' hPa';
  },
  

  formatWind: function(conditions) {
    
    // If US units, then convert from km to miles.
    var useUSUnits = this.get('controllers.index.useUSUnits'),
        speed    = (useUSUnits ? conditions.windSpeed * 0.621371 : conditions.windSpeed).toFixed(1);
    
    // Also, add the bearing.
    return speed + (useUSUnits ? ' mph' : ' kph') + ' ' + this.formatBearing(new Date(conditions.windBearing), true);
  },
  
  formatBearing: function(brng) {
    // From: http://stackoverflow.com/questions/3209899/determine-compass-direction-from-one-lat-lon-to-the-other
    var bearings = ["NE", "E", "SE", "S", "SW", "W", "NW", "N"],
        index    = brng - 22.5;
        
    if (index < 0){
      index += 360;
    }
    index = parseInt(index / 45);

    return(bearings[index]);
  },

  formatPercentage: function(value) {
    return Math.round(value * 100) + "%";
  },

  formatTime: function(date, showMinutes) {
    var hours    = date.getHours(),
        meridian = 'AM';
    
    if(hours >= 12) {
      if(hours > 12) {
        hours -= 12;
      }
      meridian = 'PM';
    }
    
    if (hours === 0) {
      hours = 12;
    }
    
    if(showMinutes) {
      var minutes = date.getMinutes();
      if(minutes < 10) {
        minutes = '0'+minutes;
      }
      
      return hours + ':' + minutes + ' ' + meridian;
    }
    return hours + ' ' + meridian;
  },

  formatTemperature: function(temp) {
    // If using US units, then convert from Celsius.
    // See: http://fahrenheittocelsius.com
    var useUSUnits = this.get('controllers.index.useUSUnits');
    return Math.round(useUSUnits ?  (temp * 9/5 + 32) : temp) +"˚";
  },  

});

export default EachCityController;