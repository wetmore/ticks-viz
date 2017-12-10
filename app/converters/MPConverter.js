import {
  RouteType,
  GradeType
} from './../types.js';
import union from 'lodash.union';
import Tick from './../tick.js';

export default class MPConverter {
  constructor() {}

  static convert(mpTick, plugins) {
    var f = (x) => mpTick[x];
    return new Tick({
      routeName: f('Route'),
      routeGrade: getRating(mpTick, GradeType.YDS),
      routeUrl: f('URL'),
      date: new Date(f('Date')),
      routeType: getRouteType(mpTick),
      tags: generateTags(mpTick, plugins || []),
      partner: null,
      notes: f('Notes'),
      crag: f('Location')
    });
  }
}

function getRouteType(mpTick) {
  var rt = mpTick['Route Type'];
  // TODO: What if the route type is "Trad, TR"?
  if (rt.includes('Trad')) return RouteType.TRAD;
  if (rt.includes('Sport')) return RouteType.SPORT;
  if (rt.includes('Boulder')) return RouteType.BOULDER;
  return RouteType.OTHER;
}

function getRating(mpTick, type) {
  var ratings = mpTick['Rating'].split(' ');
  ratings[GradeType.UK] += ' ' + ratings[GradeType.UK + 1];
  return ratings[type];
}

function generateTags(mpTick, plugins) {
  var tags = [];

  switch (mpTick['Lead Style']) {
    case 'Onsight':
      tags.push('Onsight');
    case 'Flash':
      tags.push('Flash');
    case 'Redpoint':
      tags.push('Redpoint');
    case 'Fell/Hung':
      tags.push('Hang');
  }

  switch (mpTick['Style']) {
    case 'Lead':
      tags.push('Lead');
    case 'Follow':
      tags.push('Follow');
    case 'Solo':
      tags.push('Solo');
    case 'TR':
      tags.push('TR');
  }

  var tagSets = plugins.map((p) => p(mpTick['Notes']));
  tagSets.push(tags);
  return union(tagSets);
}