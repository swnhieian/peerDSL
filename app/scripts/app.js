'use strict';

/**
 * @ngdoc overview
 * @name peerDslApp
 * @description
 * # peerDslApp
 *
 * Main module of the application.
 */
angular
  .module('peerDslApp', [
    'ngRoute',
    'summernote'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/server', {
        templateUrl: 'views/server.html',
        controller: 'ServerCtrl',
        controllerAs: 'server'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
