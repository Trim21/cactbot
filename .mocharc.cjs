'use strict';

module.exports = {
   recursive: true,
   colors: true,
   exclude: [
     // Run via test_raidboss_data.js.
     'test/helper/*',

     // TODO:
     // (1) convert these to mocha/chai
     // (2) remove from exclude list here
     // (3) remove from test/*.py files where referenced.
     'test/trigger/test_trigger.js',
   ],
};