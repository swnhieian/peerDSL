// Karma configuration
// Generated on 2016-11-18

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/summernote/dist/summernote.js',
      'bower_components/angular-summernote/dist/angular-summernote.js',
      'bower_components/peerjs/peer.js',
      'bower_components/lodash/lodash.js',
      'bower_components/ng-webworker/src/ng-webworker.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/videogular/videogular.js',
      'bower_components/videogular-controls/vg-controls.js',
      'bower_components/videogular-buffering/vg-buffering.js',
      'bower_components/ngstorage/ngStorage.js',
      'bower_components/angularjs-scroll-glue/src/scrollglue.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/videogular-overlay-play/vg-overlay-play.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/ngvideo/dist/ng-video.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-slimscroll-aiska/angular-slimscroll-aiska.js',
      // endbower
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
