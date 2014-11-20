(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree'])
  .controller('treesCtrl', function($scope) {
    localStorage.removeItem("clipboardData");
    $scope.tree1 = [
    {
      "id": 1,
      "content": "1",
      "nodes": []
    },
    {
      "id": 2,
      "content": "2",
      "nodes": [
      {
        "id": 20,
        "content": "20",
        "nodes": [
        {
          "id": 200,
          "content": "200",
          "nodes": []
        }
        ]
      },
      {
        "id": 21,
        "content": "21",
        "nodes": []
      },
      {
        "id": 22,
        "content": "22",
        "nodes": []
      }
      ]
    },
    {
      "id": 3,
      "content": "3",
      "nodes": []
    },
    {
      "id": 4,
      "content": "4",
      "nodes": []
    }
    ];
  });

})();
