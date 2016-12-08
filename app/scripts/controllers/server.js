'use strict';

/**
 * @ngdoc function
 * @name peerDslApp.controller:ServerCtrl
 * @description
 * # ServerCtrl
 * Controller of the peerDslApp
 */
angular.module('peerDslApp')
  .controller('ServerCtrl', function ($timeout) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var vm = this;
    vm.peer = new Peer('iamserver', {key: 'ggp79a86cknpnwmi'});
    vm.peerList = [];
    vm.peer.on('connection', function(conn) {
      vm.peerList.push(conn);
      vm.sendIdList();
      console.log('send');
      console.log(vm.peerList);
      conn.on('close', function() {
        console.log('closed', this.id);
         var removedId = this.id;
        _.remove(vm.peerList, function(p) { return p.id == removedId;});
        vm.sendIdList();
      });/*
      $timeout(function() {
        vm.peerList.push(conn);
        conn.on('close', function() {
          vm.peerList.remove(this);
          vm.sendIdList();
        });
        vm.sendIdList();
      });*/
    });
    vm.sendIdList = function() {
      $timeout(function() {
        var idList = [];
        for (var i = 0; i < vm.peerList.length; i++) {
          idList.push({id: vm.peerList[i].peer});
        }
        for (var i = 0; i < vm.peerList.length; i++) {
          vm.peerList[i].send(JSON.stringify(idList));
        }
      }, 1000);
    }


  });
