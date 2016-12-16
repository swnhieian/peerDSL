'use strict';

/**
 * @ngdoc function
 * @name peerDslApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the peerDslApp
 */
angular.module('peerDslApp')
  .controller('AboutCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var vm = this;
    vm.peer = new Peer({host: 'shiweinan.imwork.net', port: 10000, path:'/myapp'});
    console.log(vm.peer);
  });
