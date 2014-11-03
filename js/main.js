(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree'])
  .controller('treesCtrl', function($scope) {

    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.toggle = function(scope) {
      scope.toggle();
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.nodes.push({
        id: nodeData.id * 10 + nodeData.nodes.length,
        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
        nodes: []
      });
    };

    $scope.onKeyDown = function(scope, $event) {
      console.log($event);
      console.log($event.ctrlKey);
      console.log($event.altKey);
      console.log($event.shiftKey);
      console.log($event.keyCode);
      if ($event.shiftKey && 13 == $event.keyCode) {
        scope.newSubItem(scope);
        //$event.cancelBubble = true;
        $event.returnValue = false;
      }
    }

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
