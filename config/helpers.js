var date_format = require('dateformat');
module.exports = {
  dateFormat: function (context, options) {
    var format;
    if (options.name == 'dateFormat') {
      format = 'yyyy-mm-dd hh:MM:ss';
    } else {
      format = options;
    }
    return date_format(context, format);
  },
  json: function (context) {
    return JSON.stringify(context);
  },
  eq: function (v1, v2) {
    return v1 === v2;
  },
  ne: function (v1, v2) {
    return v1 !== v2;
  },
  lt: function (v1, v2) {
    return v1 < v2;
  },
  gt: function (v1, v2) {
    return v1 > v2;
  },
  lte: function (v1, v2) {
    return v1 <= v2;
  },
  gte: function (v1, v2) {
    return v1 >= v2;
  },
  and: function (v1, v2) {
    return v1 && v2;
  },
  or: function (v1, v2) {
    return v1 || v2;
  },
  sum: function (v1, v2) {
    return v1 + v2;
  }
};