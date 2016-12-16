'use strict';

/**
 * @ngdoc directive
 * @name peerDslApp.directive:fileReader
 * @description
 * # fileReader
 */
angular.module('peerDslApp')
  .directive('fileReader', function () {
    return {
      template: '<span><ng-transclude></ng-transclude><input type="file" style="display:none"></span>',
      restrict: 'E',
      scope: {
        videoRead: "=",
        file: "=",
        uploadFunc: "&"
      },
      replace: true,
      transclude: true,
      link: function postLink(scope, element, attributes) {
        element.bind("change", function(changeEvent) {
          scope.$apply(function() {
            scope.file = changeEvent.target.files[0];
          });
          scope.uploadFunc(scope.file);
         /* var reader = new FileReader();
          reader.onprogress = function(e) {
            console.log('loading');
            console.log(e);
          };
          reader.onload = function(loadEvent) {
            scope.$apply(function() {
              if (attributes.videoRead) {
                scope.videoRead = loadEvent.target.result;
              } else if (attributes.imageread) {
                scope.imageread = loadEvent.target.result;
              }
            });
          };
          if (attributes.videoRead) {
            reader.readAsBinaryString(changeEvent.target.files[0]);
          } else if (attributes.imageread) {
            reader.readAsDataURL(changeEvent.target.files[0]);
          }*/
        });
        var fileField = element.find('input');
        fileField.bind('click', function (e) {
          e.stopPropagation();
        });
        element.bind('click', function (e) {
          e.preventDefault();
          fileField[0].click();
        });
        //element.text('this is the fileReader directive');

      }
    };
  });
