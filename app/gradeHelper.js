import {
  mpConverter
} from './mpConverter.js';
import {
  GradeType
} from './types.js';

var GradeHelper = function(gradeData) {
  // YDSN = Yosemite Decimal System Normalized
  var YDSNValidator = /5\.(\d$|\d\d[abcd]$)/m;
  var gradeOrders = [
    [],
    [],
    [],
    [],
    [],
    []
  ];

  var letterGradeNormalizer = {
    'a': 'a',
    '-': 'a',
    'b': 'b',
    'a/b': 'b',
    '': 'c',
    'c': 'c',
    'b/c': 'c',
    'd': 'd',
    'c/d': 'd',
    '+': 'd'
  };

  var typeToCol = function(type) {
    return 'yds fr aus uiaa sa uk'.split(' ')[type];
  }

  // Loop through the grades, building a list of normalized yds grades
  // Normalized grades are yds grades with only a decimal number, or decimal
  // with one of {a,b,c,d} at the end.
  // The visualization works in terms of YDSN when arranging routes by grade,
  // but will still show the route's unnormalized YDS grade when showing route
  // info for a specific route.

  // Also build arrays of unique grade ranges for each system.
  gradeData.forEach((g) => {
    if (YDSNValidator.test(g.yds) || g.yds[0] != '5') {
      var ydsn = gradeOrders[0];
      if (ydsn.length == 0 || g.yds != ydsn[ydsn.length - 1]) {
        ydsn.push(g.yds);
      }
    }

    for (let i = 1; i < 6; i++) {
      var systemArray = gradeOrders[i];
      var newVal = g[typeToCol(i)];
      if (systemArray.length == 0 || newVal != systemArray[systemArray.length - 1]) {
        systemArray.push(newVal);
      }
    }
  });

  return {
    normalize: function(grade, type) {
      if (type == GradeType.YDS) {
        let tenAndUpMatch = /(5\.\d\d)(.*)$/.exec(grade)
        if (tenAndUpMatch) {
          let normalizedEnd = letterGradeNormalizer[tenAndUpMatch[2]];
          if (normalizedEnd) {
            return tenAndUpMatch[1] + normalizedEnd;
          } else {
            return null;
          }
        } else {
          let nineAndBelowMatch = /(5\.\d)[^\d]*$/.exec(grade);
          if (nineAndBelowMatch) {
            return nineAndBelowMatch[1];
          } else {
            return null;
          }
        }
      }
      return grade;
    },
    getGradeRange: function(data, type) {
      var relevantGrades = gradeData.map((d) => d[typeToCol(type)]);
      var indices = data.reduce(function([min, max], val) {
        var grade = relevantGrades.indexOf(mpConverter(val).getRating(type));
        if (grade < 0) {
          return [min, max];
        }
        return [Math.min(min, grade), Math.max(max, grade)];
      }, [Infinity, -1]);
      return indices.map((i) => relevantGrades[i]);
    },
    getAllGradesFor: function(type) {
      return gradeOrders[type];
    }
  };
}

export {
  GradeHelper
};