import uuid from 'js-uuid';

export default class Tick {
  constructor(tick) {
    this.id = uuid();
    this.routeName = tick.routeName;
    this.routeGrade = tick.routeGrade;
    this.date = tick.date;
    this.routeType = tick.routeType;
    this.routeUrl = tick.routeUrl;
    this.tags = tick.tags;
    this.partner = tick.partner;
    this.notes = tick.notes;
    this.crag = tick.crag;
  }
}
