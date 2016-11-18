'use strict';

/**
 * @ngdoc filter
 * @name peerDslApp.filter:toTrusted
 * @function
 * @description
 * # toTrusted
 * Filter in the peerDslApp.
 */
angular.module('peerDslApp')
  .filter('toTrusted', ['$sce', function ($sce) {
    return function (input) {
      return $sce.trustAsHtml(input);
    };
  }]);
