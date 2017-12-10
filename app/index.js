import dateFns from 'date-fns';
import GradeHelper from './gradeHelper.js';
import {
  mpConverter
} from './mpConverter.js';
import {
  GradeType,
  RouteType,
  Style,
  LeadStyle
} from './types.js';

var margin = {
    left: 40,
    right: 40,
    top: 40,
    bottom: 40
  },
  w = 1000 - margin.left - margin.right,
  h = 500 - margin.top - margin.bottom;

var svg = d3.select('.chart')
  .attr("width", w + margin.left + margin.right)
  .attr("height", h + margin.top + margin.bottom)
  .append('g')
  .attr('class', 'inner-chart-area')
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load data
d3.tsv('data/ritter_ticks.tsv', function(data) {
  d3.tsv('data/grades.tsv', function(gradeData) {
    // Create the grade helper.
    var GRADE_TYPE = GradeType.YDS;
    var gradeHelper = new GradeHelper(gradeData, GRADE_TYPE);

    // Get all grades for the current grade type.
    var grades = gradeHelper.getAllGrades();

    // Get the smallest range of grades containing the routes in the
    // user's ticks.
    var gradeRange = gradeHelper.getGradeRange(data)

    let [start, end] = d3.extent(data, (d) => mpConverter(d).getDate())
    var dateRange = [dateFns.startOfMonth(start), dateFns.endOfMonth(end)];
    console.log(gradeRange.map((g) => gradeHelper.normalize(g)), dateRange);


    // Arrange the data by date, then by
    var nestedData = d3.nest()
      .key(function(d) {
        var date = mpConverter(d).getDate();
        return dateFns.startOfMonth(date);
      })
      .key(function(d) {
        return gradeHelper.normalize(mpConverter(d).getRating(GRADE_TYPE));
      })
      .entries(data.filter((d) => {
        var rt = mpConverter(d).getRouteType();
        return rt == RouteType.TRAD;
      }));

    console.log(nestedData);

    // Create y-axis of grades.
    var y = d3.scaleBand()
      .domain(grades.slice(grades.indexOf(gradeRange[0]) - 1, grades.indexOf(gradeRange[1]) + 1))
      .range([h, 0]);

    var x = d3.scaleTime()
      .domain(dateRange)
      .range([40, w]);

    // Create the months elements.
    var months = svg.selectAll('g')
      .data(nestedData) // by month
      .enter().append('g')
      .attr('transform', function(d, i) {
        return 'translate(' + x(new Date(d.key)) + ',' + 0 + ')';
      })

    // Create the rows of grades for each month.
    var gradeRows = months.selectAll('g') // by grade
      .data(function(d) {
        return d.values;
      })
      .enter().append('g')
      .attr('transform', function(d, i) {
        return 'translate(' + 0 + ',' + y(d.key) + ')';
      })

    /*gradeRows.append('rect')
    .attr('width', 5)
    .attr('height', 5)
    .attr('fill', 'red')*/

    function handleMouseDown(d, i) {
      var routeInfo = d3.select('.routeInfo')
        .selectAll('li')
        .data(d3.entries(d));

      routeInfo.enter().append('li')
        .merge(routeInfo)
        .text((d) => d.key + ': ' + d.value);

      routeInfo.exit().remove();
    }

    function handleMouseOver(d, i) {
      d3.select(this).attr('fill', 'red');
    }

    function handleMouseOut(d, i) {
      d3.select(this).attr('fill', null);
    }

    // Create the routes in each grade.
    var tickHeight = 5;
    var tickWidth = 5;
    var routes = gradeRows.selectAll('rect') // per route
      .data(function(d) {
        return d.values;
      })
      .enter().append('rect')
      .attr('x', function(d, i) {
        return i * (tickWidth + 1);
      })
      .attr('y', (y.bandwidth() - tickHeight) / 2)
      .attr('width', tickWidth)
      .attr('height', tickHeight)
      .on("mouseover", handleMouseOver)
      .on("mousedown", handleMouseDown)
      .on("mouseout", handleMouseOut);

    // Make the ticks dotted.
    function customYAxis(g) {
      g.call(d3.axisRight(y).tickSize(w));
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
      g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
    }

    function customXAxis(g) {
      g.call(d3.axisTop(x));
    }

    // Attach the y-axis.
    svg.append("g")
      .attr("class", "axis y")
      .attr("transform", "translate(0,0)")
      .call(customYAxis);

    svg.append('g')
      .attr('class', 'axis x')
      .attr('transform', 'translate(0,0)')
      .call(customXAxis);

  });
});