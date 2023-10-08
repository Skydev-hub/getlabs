// Once server compilation is moved in to the angular CLI build process in angular 9+, this file should be removed
// along with the build target that uses it in angular.json
const _ = require('lodash')
module.exports = (config, context) => {
  _.mergeWith(config, require('../../custom-webpack.config'), (dest, src) => {
    if (_.isArray(dest)) {
      return dest.concat(src);
    }
  });
  return config;
};
