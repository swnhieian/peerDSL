'use strict';

/**
 * @ngdoc function
 * @name peerDslApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the peerDslApp
 */
angular.module('peerDslApp')
  .controller('MainCtrl', function ($scope, $timeout) {
    var vm = this;
    vm.messageList = [
        {
          source: 'send',
          type: 'text',
          content: 'hello'
        },
        {
          source: 'receive',
          type: 'text',
          content: 'world'
        },
        {
          source: 'system',
          type: 'text',
          content: 'aaaaa'
        }
      ];
    vm.summernoteConfig = {
        height: 300,
        lang: 'zh-CN'
    };
    vm.addMsg = function(source, type, content) {
        $timeout(function() {
            vm.messageList.push({
                source:source,
                type: type,
                content: content
            });
        });
    }
    vm.connectPeer = function(mateId) {
        vm.conn = vm.peerObj.connect(mateId);
        vm.conn.on('open', function() {
            vm.addMsg('system','text','您已经成功与' + mateId + '建立了连接');
            vm.conn.on('data', vm.receiveMsg);
        })
    };
    vm.receiveMsg = function(data) {
        console.log('received' + data);
        vm.addMsg('receive', 'text', data);
    };
    vm.sendMsg = function(data) {
        if (vm.conn == null) return;
        console.log('send' + data);
        vm.conn.send(data);
        vm.addMsg('send','text', data);
    };
    vm.generateID = function() {
        vm.peerObj = new Peer({key: 'ggp79a86cknpnwmi'});
        vm.peerObj.on('open', function(id) {
            $scope.$apply(vm.peerID = id);
        });
        vm.peerObj.on('connection', function(conn) {
            vm.conn = conn;
            conn.on('open', function() {
                console.log('hhhhh');
                vm.addMsg('system', 'text', conn.peer + '已经成功与您建立了连接');
            });
            conn.on('data', vm.receiveMsg);
        });
    };
    vm.generateID();
  });
