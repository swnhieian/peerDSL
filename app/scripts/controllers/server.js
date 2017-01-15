'use strict';

/**
 * @ngdoc function
 * @name peerDslApp.controller:ServerCtrl
 * @description
 * # ServerCtrl
 * Controller of the peerDslApp
 */
//angular.module('peerDslApp')
//  .controller('ServerCtrl', function ($timeout) {
var ServerCtrl = function($timeout) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var vm = this;
    //vm.peer = new Peer('iamserver', {key: 'ggp79a86cknpnwmi'});
    vm.peer = new Peer('iamserver', {host: 'shiweinan.imwork.net', port: 10000, path:'/myapp'/*,config:{'iceServers':[{url:'turn:yuan@'+'60.205.170.105'+':12583',credential:'yuan'}]}*/});
    vm.peerList = [];
    vm.confList = [];
    vm.broadcast = function(data) {
      console.log("broadcast", data);
      _.forEach(vm.peerList, function(a) {
        a.send(data);
      });
    };
    vm.sendConfList = function(conn) {
      var idList = [];
      for (var i = 0; i < vm.confList.length; i++) {
        idList.push({id: vm.confList[i].id, name:vm.confList[i].name});
      }
      $timeout(function() {conn.send({type:'confList', data: idList});}, 20);
      console.log('sendconfList',idList);
    };
    vm.sendList = function(conn) {
      var idList = [];
      for (var i = 0; i < vm.peerList.length; i++) {
        idList.push({id: vm.peerList[i].peer, name:vm.peerList[i].name});
      }
      $timeout(function() {conn.send({type:'peerList', data: idList});}, 20);
      console.log('sendList',idList);
    };
    vm.peer.on('connection', function(conn) {
      conn.name = conn.peer;
      //vm.sendList(conn);
      vm.broadcast({type: 'newPeer', data: {id: conn.peer, name: conn.peer}});
      $timeout(function() {vm.peerList.push(conn);vm.peerList=_.uniqBy(vm.peerList, 'peer');});
      //_.forEach(vm.peerList, function(c) {vm.sendList(c);});
      //vm.sendIdList();
      //console.log('send');
      //console.log(vm.peerList);
      conn.on('close', function() {
        console.log('closed', this.id);
        var closedId = this.id;
        var index = _.findIndex(vm.confList, function(o) {return o.id == closedId});
        if (index >=0) {
	  vm.confList.splice(index, 1);
          vm.broadcast({type: 'closeConference', data: {id: closedId}});
        } 
        _.remove(vm.peerList, function(o) {return o.peer == closedId;});       
        vm.broadcast({type:'closePeer', data: {id: this.peer}});
        /* var removedId = this.id;
        _.remove(vm.peerList, function(p) { return p.id == removedId;});
        vm.sendIdList();*/
      });
      conn.on('data', function(data) {
        console.log('get data', data);
        vm.process(data, this);
      });
      /*
      $timeout(function() {
        vm.peerList.push(conn);
        conn.on('close', function() {
          vm.peerList.remove(this);
          vm.sendIdList();
        });
        vm.sendIdList();
      });*/
    });
    vm.process = function(data, conn) {
      $timeout(function() {
        switch(data.type) {
          case 'peerList':
            vm.sendList(conn);
            break;
          case 'changeName':
            vm.broadcast({type:'changeName',data: {id: conn.peer, name:data.data}});
            _.forEach(vm.peerList, function(p) {
              if (p.peer == conn.peer) p.name = data.data;
            });
            break;
          case 'newConference':
            $timeout(function() {vm.confList.push({id: data.id, name:data.name});});
            vm.broadcast({type:'newConference', data: {id: data.id, name:data.name}});
            break;
          case 'confList':
            vm.sendConfList(conn);
            break;
          case 'closeConference':
            _.remove(vm.confList, function(c) {
              return c.id == data.id;
            });
            vm.broadcast({type:'closeConference', data: {id: data.id}});
            break;
          default:
            break;
        }

      });
    };
    vm.over = function() {
      vm.broadcast({type:'presentOver'})
    }
    vm.sendIdList = function() {
      $timeout(function() {
        var idList = [];
        for (var i = 0; i < vm.peerList.length; i++) {
          idList.push({id: vm.peerList[i].peer, name:vm.peerList[i].name});
        }
        for (var i = 0; i < vm.peerList.length; i++) {
          vm.peerList[i].send(JSON.stringify(idList));
        }
      });
    }


  }//);
