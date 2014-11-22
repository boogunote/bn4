(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree'])
  .controller('treesCtrl', function($scope) {
    localStorage.removeItem("clipboardData");
    $scope.tree1 = [
    {
      "id": 1,
      "content": "1",
      "selected" : false,
      "collapsed" : false,
      "nodes": []
    },
    {
      "id": 2,
      "content": "2",
      "selected" : false,
      "collapsed" : false,
      "nodes": [
      {
        "id": 20,
        "content": "20",
        "selected" : false,
        "collapsed" : false,
        "nodes": [
        {
          "id": 200,
          "content": "200",
          "selected" : false,
          "collapsed" : false,
          "nodes": []
        }
        ]
      },
      {
        "id": 21,
        "content": "21",
        "selected" : false,
        "collapsed" : false,
        "nodes": []
      },
      {
        "id": 22,
        "content": "22",
        "selected" : false,
        "collapsed" : false,
        "nodes": []
      }
      ]
    },
    {
      "id": 3,
      "content": "3",
      "selected" : false,
      "collapsed" : false,
      "nodes": []
    },
    {
      "id": 4,
      "content": "4",
      "selected" : false,
      "collapsed" : false,
      "nodes": []
    }
    ];
  });

})();
