'use strict';

/**
 * @ngdoc function
 * @name peerDslApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the peerDslApp
 */
angular.module('peerDslApp')
  .controller('MainCtrl', function ($scope, $timeout, $sce, Webworker, $localStorage, $uibModal) {
    var vm = this;
    $scope.$storage = $localStorage;
    vm.getMyVideoStream = function() {
      if (vm.myVideoStream) return;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({audio: true, video: true}, function(stream) {
        $timeout(function() {
          vm.myVideoStream = stream;
          console.log("value to my video", vm.myVideoStream);
          vm.myVideoConfig = {
            theme: 'bower_components/videogular-themes-default/videogular.css',
            sources: [
              {src: $sce.trustAsResourceUrl(URL.createObjectURL(vm.myVideoStream)), type: 'video/webm'}
            ]
          };
        });
      }, function(){ console.log('get video stream error'); });
    };
    vm.init = function() {
      vm.errorHandler = function() {
        var msg = '';
        switch (e.code) {
          case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
          case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
          case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
          case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
          case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
          default:
            msg = 'Unknown Error';
            break;
        };
        console.log('Error: ' + msg);
      } ;
      /*if ($localStorage.peerId) {
        vm.peerObj = new Peer($localStorage.peerId, {host: 'shiweinan.imwork.net', port: 10000, path: '/myapp'});
      } else {*/
        vm.peerObj = new Peer({host: 'shiweinan.imwork.net', port: 10000, path: '/myapp'});
        $timeout(function() {
          vm.peerId = vm.peerObj.id;
          vm.peerName = vm.peerId;
          vm.changeName();
        });
      //}
      vm.activePeerList = [];
      console.log('create peer ok');
      vm.serverConn = vm.peerObj.connect('iamserver');
      vm.serverConn.on('open', function() {
        console.log('connect server ok!');
        vm.serverConn.send({type: 'peerList'});
      });
      vm.serverConn.on('data', function(data) {
        vm.processServerData(data);
      });
      vm.peerObj.on('connection', function(conn) {
        console.log('connected by:',conn.peer);
        conn.on('data', function(data) {
          console.log(data);
          var thisPeer = _.find(vm.activePeerList, function(p) {return p.id == conn.peer});
          if (data.type == 'video') {
            var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            requestFileSystem(window.TEMPORARY, 500*1024*1024 /*500MB*/, function(fs) {
              console.log(fs);
              fs.root.getFile(data.name, {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                  fileWriter.onwriteend = function(e) {
                    console.log('write completed.', data.name);
                    if (data.index == 0) {
                      var video = {type:'video', sources: [{src:fileEntry.toURL(),type:'video/mp4'}], source: 'peer',index:data.index,length:data.length};
                      if (vm.activePeerId != conn.peer) {
                        _.remove(vm.activePeerList, function (p) {
                          return p.id == conn.peer;
                        });
                        thisPeer.unread = thisPeer.unread || 0;
                        thisPeer.unread++;
                        if (!vm.activePeerId) vm.activePeerList.splice(0, 0, thisPeer);
                        else vm.activePeerList.splice(0, 0, thisPeer);
                      }
                      $timeout(function() {
                        console.log(video);
                        thisPeer.message = thisPeer.message || [];
                        thisPeer.message.push(video);
                      });
                    } else {

                    }
                  };
                  fileWriter.onerror = function(e) {
                    console.log('write failed:' + e.toString());
                  };
                  var bb = new Blob([data.content]);
                  fileWriter.write(bb);
                }, vm.errorHandler);
              }, vm.errorHandler);
            }, vm.errorHandler);

              /*vm.flag = true;
              var url = $sce.trustAsResourceUrl(URL.createObjectURL(new Blob([data.content])));
              console.log(url);
              $scope.$apply(vm.onlineVideoURL = url);
              vm.onlineVideoConfig = {
                theme: 'bower_components/videogular-themes-default/videogular.css',
                sources: [
                  {src: url, type: 'video/mp4'}
                ]
              };*/
          } else {
            if (vm.activePeerId != conn.peer) {
              _.remove(vm.activePeerList, function (p) {
                return p.id == conn.peer;
              })
              thisPeer.unread = thisPeer.unread || 0;
              thisPeer.unread++;
              if (!vm.activePeerId) vm.activePeerList.splice(0, 0, thisPeer);
              else vm.activePeerList.splice(0, 0, thisPeer);
            }
            thisPeer.message = thisPeer.message || [];
            $timeout(function () {
              thisPeer.message.push(data);
            });
          }
        });
      });
      vm.peerObj.on('call', function(call) {
        console.log('on call', call);
        vm.requestCall(call)
          .then(function(){
            if (vm.activeCall) {
              vm.activeCall.close();
            }
            call.answer(vm.myVideoStream);
            vm.showMyVideo = true;
            vm.handleCall(call);
          }, function() {
            vm.showMyVideo = false;
            vm.showPeerVideo = false;
            var conn = vm.peerObj.connect(call.peer);
            conn.on('open', function() {
              conn.send({type: 'system', content:'对方拒绝了与您的视频聊天', source: 'system'});
            });
          });
      });
      vm.getMyVideoStream();
    };
    vm.init();
    vm.requestCall = function(call) {
      var modalInstance = $uibModal.open({
        size: 'lg',
        templateUrl: 'requestCallModalContent.html',
        controller: 'requestCallModalCtrl',
        controllerAs: 'vm',
        resolve: {
          peerName: function() {
            return _.find(vm.activePeerList, function(p) { return p.id == call.peer}).name;
          }
        }
      });
      return modalInstance.result;
    };
    vm.handleCall = function(call) {
      console.log('handleCall', call);
      call.on('stream', function(stream) {
        $timeout(function() {
          vm.showMyVideo = true;
          vm.showPeerVideo = true;
          vm.peerVideoStream = stream;
          vm.peerVideoConfig = {
            theme: 'bower_components/videogular-themes-default/videogular.css',
            sources: [
              {src: $sce.trustAsResourceUrl(URL.createObjectURL(vm.peerVideoStream)), type: 'video/webm'}
            ]
          };
          vm.activeCall = call;
        });
      });
      call.on('close', function() {
        vm.showMyVideo = false;
        vm.showPeerVideo = false;
        vm.myVideoConfig.sources = [];
        vm.peerVideoConfig.sources = [];
        var tempP = _.find(vm.activePeerList, function(p) { return p.id == call.peer});
        tempP.message = tempP.message || [];
        tempP.message.push({type: 'system', source: 'system', content:'您的通话连接已断开'});
      })
    };
    vm.changeName = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'changeNameModalContent.html',
        controller: 'changeNameModalCtrl',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
          initName: function () {
            return vm.peerName;
          }
        }
      });
      modalInstance.result.then(function (name) {
        vm.peerName = name;
        vm.serverConn.send({'type':'changeName', data: name});
      }, function () {});
    };
    vm.processServerData = function(data) {
      console.log('processServerData', data);
      $timeout(function() {
        switch (data.type) {
          case 'peerList':
            vm.activePeerList = _.concat(data.data, vm.activePeerList);
            break;
          case 'newPeer':
            vm.activePeerList.push(data.data);
            break;
          case 'closePeer':
            _.remove(vm.activePeerList, function (p) {
              return p.id == data.data.id;
            });
            break;
          case 'changeName':
            if (data.data.id == vm.peerId) break;
            _.forEach(vm.activePeerList, function(p) {
              if (p.id == data.data.id) p.name = data.data.name;
            });
            break;
          default:
            break;
        }
        ;
      });
    };
    vm.connectPeer = function(peerId) {
      if (vm.activePeerId == peerId) return;
      vm.activePeerId = peerId;
      vm.activePeer = _.find(vm.activePeerList, function(p) {return p.id == peerId});
      vm.activePeer.unread = 0;
      vm.activePeerConn = vm.peerObj.connect(peerId);
      vm.activePeerConn.on('open', function() { console.log('connect peer!');});
      //_.remove(vm.activePeerList, function(p) {return p.id == peerId});
      //vm.activePeerList.splice(0, 0, vm.activePeer);
    };
    vm.sendMessage = function() {
      if (!vm.activePeer) return;
      vm.activePeerConn.send({type: 'text', content: vm.inputMessage, source:'peer'});
      vm.activePeer.message = vm.activePeer.message || [];
      vm.activePeer.message.push({type: 'text', content: vm.inputMessage, source: 'self'});
      vm.inputMessage = "";
    };
    vm.sendPicture = function(file) {
      var reader  = new FileReader();
      reader.onload = function(e) {
        var res = this.result;
        vm.activePeerConn.send({type: 'picture', content: res, source: 'peer'});
        vm.activePeer.message = vm.activePeer.message || [];
        vm.activePeer.message.push({type: 'picture', content: res, source: 'self'});
      };
      reader.readAsDataURL(file);
    } ;
    vm.sendVideo = function(file) {
      vm.start = 0;
      vm.READBLOCKSIZE = 511;
      //vm.uploadVideo(file);
      vm.worker = new Worker('scripts/controllers/videoSplitter.js');
      vm.worker.onmessage = function(result) {
        if (result.data.type =='done') {
          console.log('in worker message', result);
          _.forEach(result.data.data, function(f, key) {
            vm.activePeerConn.send({type:'video', content:f.data, name:f.name, length:result.data.data.length, index: key});
            console.log('send', f.name);
          })
        } else {
          console.log(result.data.type);
        }
      };
      var reader = new FileReader();
      reader.onload = function() {
        var contents = this.result;
        var files = [{
          name: file.name,
          data: new Uint8Array(contents)
        }];
        vm.worker.postMessage(files);
      };
      reader.readAsArrayBuffer(file);
    };
    vm.changeVideo = function(m) {
      console.log('on complete');
      //console.log(m);
      var re = new RegExp("output" + m.index + ".mp4");
      if (m.index < m.length - 1) {
        //$timeout(function() {
          $timeout(function() {
            m.sources = [{src: m.sources[0].src.replace(re, "output" + (m.index + 1) + ".mp4"), type:'video/mp4'}];
            m.index += 1;
          });
          console.log(m.sources[0].src);

        //$timeout(vm.API.play.bind(vm.API), 2000);
        //});
        console.log(m.index);
      } else {
        m.sources = [{src : m.sources[0].src.replace(re, "output0.mp4"), type:'video/mp4'}];
        m.index = 0;
      }
    };
    vm.uploadVideo = function(file) {
      var reader = new FileReader();
      var result = file.slice(vm.start, (vm.READBLOCKSIZE + vm.start));
      reader.onload = function() {
        var contents = this.result;
        console.log(contents);
        vm.activePeerConn.send({type:'video', content:contents, source:'peer'});
        if (vm.READBLOCKSIZE + vm.start < file.size) {
          vm.start = vm.READBLOCKSIZE + vm.start;
          vm.uploadVideo(file);
        } else {
          console.log('upload over!');
        }
      };
      reader.readAsDataURL(result);
    };
    vm.videoChat = function() {
      if (!vm.activePeer) return;
      var call = vm.peerObj.call(vm.activePeerId, vm.myVideoStream);
      vm.handleCall(call);
    };
    vm.stopVideoChat = function() {
      vm.showMyVideo = false;
      vm.showPeerVideo = false;
      vm.activeCall.close();
      vm.myVideoConfig.sources = [];
      vm.peerVideoConfig.sources = [];
    };
    vm.myVideoMuted = function(API) {
      API.setVolume(0);
    };
    vm.onlinePlayerReady = function(API) {
      vm.API = API;
    };



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
    /*vm.connectPeer = function(mateId) {
        vm.conn = vm.peerObj.connect(mateId);
        vm.conn.on('open', function() {
            vm.addMsg('system','text','您已经成功与' + mateId + '建立了连接');
            vm.conn.on('data', vm.receiveMsg);
        })
    };*/
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
    vm.peerList = [];
    vm.activePeerId = '';
    vm.generateID = function() {
      vm.peerObj = new Peer({key: 'ggp79a86cknpnwmi'});
      console.log('me', vm.peerObj);
      vm.serverConn = vm.peerObj.connect('iamserver');
      vm.serverConn.on('open', function() {
        console.log('connect to server!!!');
      });
      vm.serverConn.on('data', function(data) {
        console.log('recive data');
        console.log(JSON.parse(data));
        $timeout(vm.peerList = JSON.parse(data));
        $timeout(vm.getPeerStatus());
      });
      vm.peerObj.on('call', function(call) {
        call.answer(vm.localStream);
        vm.myVideo = (URL.createObjectURL(vm.localStream));
        vm.handleCall(call);
      });
      angular.element('.playVideo').on('ended',function() {
        console.log('ended!');
        vm.startPlay();
      });
      vm.endVideo = function() {
        alert('ended!');
        vm.startPlay(vm.playingPart + 1);
      };
      /*vm.startPlay = function(num) {
        if (vm.playing) return;
        if (num>=vm.videos.length) {vm.playing = false;return;}
        vm.playing = true;
        vm.playingPart = num;
        var url = URL.createObjectURL(vm.videos[vm.playingPart]);
        $scope.$apply(vm.transferVideo = url);
        //angular.element('.playVideo').src = url;

      };*/
      vm.videos = [];
      vm.playing = false;
      vm.playingPart = 0;
      vm.allVideos = [];
      vm.peerObj.on('connection', function(conn) {
        conn.on('data', function(data) {
          console.log('receive video data');
          console.log(data);
          //console.log(URL.createObjectURL(data));
          var blobdata = new Blob([data]);
          vm.videos.push(blobdata);
          vm.allVideos.push({
            src: URL.createObjectURL(blobdata),
            type: 'video/mp4'
          });
          if (!vm.playing) {
            vm.startvideogular();
            vm.startPlay();
            vm.playing = true;
          }
        });
      })
    };
    /*vm.handleCall = function(call) {
      console.log('handle call');
      call.on('stream', function(stream) {
        //vm.peerVideo = URL.createObjectURL(stream);
        vm.videoConfig.sources = [{
          src: $sce.trustAsResourceUrl(URL.createObjectURL(stream)),
          type: 'video/webm'
        }];
        console.log(vm.videoConfig);
        console.log(vm.peerVideo);
      });
    };*/
    vm.activePeerId = '';
    // vm.connectPeer = function(p) {
    //   vm.activePeerId = p.id;
    //   console.log('connecting ' + p.id  + '...');
    //   vm.activeConn = vm.peerObj.connect(p.id);
    //   vm.activeConn.on('open', function() {
    //     console.log('connect successful!');
    //   });
    //   vm.activeConn.on('data', function(data) {
    //     console.log('receive data');
    //     console.log(data);
    //     console.log(URL.createObjectURL(data));
    //     vm.transferVideo = URL.createObjectURL(data);
    //   });
    //
    // };
    vm.getPeerStatus = function() {
      _.forEach(vm.peerList, function(p) {
        p.status = "good";
      });
    };
    vm.trustSrc = function(url) {
      return $sce.trustAsResourceUrl(url);
    };
    /*vm.videoChat = function() {
      console.log('hello');
      vm.call = vm.peerObj.call(vm.activePeerId, vm.localStream);
      vm.handleCall(vm.call);
    };*/
    vm.generateIDOri = function() {
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
   /* vm.init = function() {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        vm.myVideo = (URL.createObjectURL(stream));
        console.log("value to my video", vm.myVideo);
        vm.localStream = stream;
      }, function(){ console.log('error'); });
      vm.generateID();
    };
    vm.init();*/
    $scope.$watch('vm.videoFile', function(newV, oldV) {
      console.log("reading file", newV);
    });
    /*vm.uploadVideo = function(file) {
      console.log(file);
      console.log(typeof(file));
      var reader = new FileReader();
      reader.onload = function() {
        var contents = this.result;
        var files = [{
          name: file.name,
          data: new Uint8Array(contents)
        }];
        vm.worker.postMessage(files);
        /!*vm.worker.run(files)
          .then(function(result) {
            console.log('in worker finish', result);
          }, function(err) {
            console.log('in worker err', err);
          }, function(data) {
            console.log('in worker notify', data)
          });*!/
      };
      reader.readAsArrayBuffer(file);

      /!*console.log(file.name);
      var reader = new FileReader();
      var start = 0;
      var READBLOCKSIZE = 511;
      var result = file.slice(start, (READBLOCKSIZE + start));
      reader.onload = function() {
        var contents = this.result;
        console.log(contents);
        vm.activeConn.send(contents);
        if (READBLOCKSIZE + start < file.size) {
          start = READBLOCKSIZE + start;
          //vm.uploadVideo(file);
        } else {
          console.log('upload over!');
        }
      };
      reader.readAsBinaryString(result);*!/
    };*/
    vm.startPlay = function() {
      console.log(vm.playingPart);
      if (vm.playingPart >= vm.videos.length) return;
      var url = URL.createObjectURL(vm.videos[vm.playingPart]);
      vm.transferVideo = url;
      vm.playingPart ++;
      console.log(vm.playingPart);
    };
    //vm.worker = Webworker.create('scripts/controllers/videoSplitter.js', {async: true});
    /*vm.worker = new Worker('scripts/controllers/videoSplitter.js');
    vm.worker.onmessage = function(result) {
      if (result.data.type =='done') {
        console.log('in worker message', result);
        _.forEach(result.data.data, function(f) {
          vm.activeConn.send(f.data);
          console.log('send', f.name);
        })
      } else {
        console.log(result.data.type);
      }
    };
    vm.videoConfig = {
      theme: "bower_components/videogular-themes-default/videogular.css",
      sources: [
      ]
    }
    vm.API = null;
    vm.onPlayerReady = function(api) {
      console.log('videogular ready');
      vm.API = api;
    }
    vm.videogularnum = 0;
    vm.startvideogular = function() {
      if (vm.videogularnum >= vm.allVideos.length) return;
      vm.videoConfig.sources = [];
      vm.videoConfig.sources.push(vm.allVideos[vm.videogularnum]);
      vm.API.play();
      vm.videogularnum ++;
      console.log("videogular num", vm.videogularnum);
    }*/



  });
angular.module('peerDslApp')
  .controller('changeNameModalCtrl', function(initName, $uibModalInstance) {
  var vm = this;
  vm.name = initName;
  vm.ok = function() {
    $uibModalInstance.close(vm.name);
  };
  vm.cancel = function() {
    $uibModalInstance.dismiss();
  };
});
angular.module('peerDslApp')
  .controller('requestCallModalCtrl', function(peerName, $uibModalInstance) {
    var vm = this;
    vm.name = peerName;
    vm.ok = function() {
      $uibModalInstance.close(vm.name);
    };
    vm.cancel = function() {
      $uibModalInstance.dismiss();
    };
  });
