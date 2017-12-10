import {
  RouteType,
  GradeType
} from './types.js';

// Create common type for the data
var mpConverter = function(mpTick) {
  return {
    getRouteType: function() {
      var rt = mpTick['Route Type'];
      // TODO: What if the route type is "Trad, TR"?
      if (rt.includes('Trad')) return RouteType.TRAD;
      if (rt.includes('Sport')) return RouteType.SPORT;
      if (rt.includes('Boulder')) return RouteType.BOULDER;
      return RouteType.OTHER;
    },
    getRating: function(type) {
      var ratings = mpTick.Rating.split(' ');
      ratings[GradeType.UK] += ' ' + ratings[GradeType.UK + 1];
      return ratings[type];
    },
    getDate: function() {
      return new Date(mpTick.Date);
    }
  }
};

export {
  mpConverter
};