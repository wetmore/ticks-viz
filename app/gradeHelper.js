import {
  mpConverter
} from './mpConverter.js';
import {
  GradeType
} from './types.js';

export default class GradeHelper {
  constructor(gradeData, type) {
    this.gradeData_ = gradeData;
    this.type_ = type;

    /* YDSN = Yosemite Decimal System Normalized. This means no -,+, or slash
     * grades, only number and letter grades. Grades in YDS which are not in YDSN
     * are mapped to a YDSN grade according to the letterGradeNormalizer map
     * below.
     * 
     * The visualization works in terms of YDSN when arranging routes by grade,
     * but will still show the route's unnormalized YDS grade when showing route
     * info for a specific route.
     */
    var YDSNValidator = /5\.(\d$|\d\d[abcd]$)/m;
    this.letterGradeNormalizer_ = {
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

    this.gradeOrders_ = [
      [],
      [],
      [],
      [],
      [],
      []
    ];

    // Build arrays of unique grade ranges for each system.
    gradeData.forEach((g) => {
      for (let i = 0; i < 6; i++) {
        var newVal = g[this.typeToCol_(i)];
        var systemArray = this.gradeOrders_[i];

        // If we are looking at a yds grade and it's not a valid YDSN grade,
        // skip it.
        if (i == 0 && !(YDSNValidator.test(newVal) || newVal[0] != '5')) {
          continue;
        }

        if (systemArray.length == 0 || newVal != systemArray[systemArray.length - 1]) {
          systemArray.push(newVal);
        }
      }
    });
  }

  typeToCol_(type) {
    return 'yds fr aus uiaa sa uk'.split(' ')[type];
  }

  normalize(grade) {
    if (this.type_ == GradeType.YDS) {
      let tenAndUpMatch = /(5\.\d\d)(.*)$/.exec(grade)
      if (tenAndUpMatch) {
        let normalizedEnd = this.letterGradeNormalizer_[tenAndUpMatch[2]];
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
          // What about other class terrain?
          return null;
        }
      }
    }
    return grade;
  }

  getGradeRange(data) {
    var type = this.type_;
    var relevantGrades = this.gradeData_.map((d) => d[this.typeToCol_(type)]);
    var indices = data.reduce(function([min, max], val) {
      var grade = relevantGrades.indexOf(mpConverter(val).getRating(type));
      if (grade < 0) {
        return [min, max];
      }
      return [Math.min(min, grade), Math.max(max, grade)];
    }, [Infinity, -1]);
    return indices.map((i) => relevantGrades[i]);
  }

  getAllGrades() {
    return this.gradeOrders_[this.type_];
  }
}
