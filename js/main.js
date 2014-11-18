(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree'])
  .controller('treesCtrl', function($scope) {

    $scope.tree1 = [{
      "id": 1,
      "title": "tree1 - item1",
      "nodes": [],
    }, {
      "id": 2,
      "title": "tree1 - item2",
      "nodes": [],
    }, {
      "id": 3,
      "title": "tree1 - item3",
      "nodes": [],
    }, {
      "id": 4,
      "title": "tree1 - item4",
      "nodes": [],
    }];
  });

})();
