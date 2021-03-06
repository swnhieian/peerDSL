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
    'summernote',
    'ngWebworker',
    'ngStorage',
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.overlayplay",
    "com.2fdevs.videogular.plugins.buffering",
    "luegg.directives",
    "ui.bootstrap",
    "ui.router",
    'ngVideo',
    "ngSlimScroll"
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('server', {
        url: '/server',
	      abstract: false,
        templateUrl: 'views/server.html',
        controller: ServerCtrl,
        controllerAs: 'server'
      })
      .state('main', {
        url: '/',
	      abstract: false,
        templateUrl: 'views/main.html',
        controller: MainCtrl,
        controllerAs: 'main'
      });
    //$locationProvider.html5Mode(true);
    /*$routeProvider
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
      });*/
  });
