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
    'summernote',
    'ngWebworker',
    'ngStorage',
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "luegg.directives",
    "ui.bootstrap"
  ])
  .config(function ($routeProvider) {
/*    $urlRouteProvider.otherwise('/');
    $stateProvider
      .state('server', {
        url: '/server',
        templateUrl: 'views/server.html',
        controller: 'ServerCtrl',
        controllerAs: 'server'
      })
      .state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      });*/
    //$locationProvider.html5Mode(true);
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
