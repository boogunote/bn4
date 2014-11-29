(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree', 'firebase'])
  .controller('treesCtrl', function($scope, $firebase) {
    localStorage.removeItem("clipboardData");
    $scope.username = "user1";
    $scope.app_name = "boogunote";    
    $scope.base_url = "https://boogu.firebaseio.com/" + $scope.username + "/" + $scope.app_name + "/trees/" + "first_tree";

    var ref = new Firebase($scope.base_url);
    var remoteTree = $firebase(ref).$asObject();
    remoteTree.$loaded().then(function() {
      $scope.tree1 = remoteTree.nodes;
      ref.on("child_changed", function(childSnapshot, prevChildName) {
        // code to handle child data changes.
        console.log(childSnapshot.val());
        console.log(prevChildName);
        $scope.tree1 = childSnapshot.val();
      });
    });
    
    

    // $scope.tree1 = [
    // {
    //   "id": 1,
    //   "content": "1",
    //   "selected" : false,
    //   "collapsed" : false,
    //   "nodes": []
    // },
    // {
    //   "id": 2,
    //   "content": "2",
    //   "selected" : false,
    //   "collapsed" : false,
    //   "nodes": [
    //   {
    //     "id": 20,
    //     "content": "20",
    //     "selected" : false,
    //     "collapsed" : false,
    //     "nodes": [
    //     {
    //       "id": 200,
    //       "content": "200",
    //       "selected" : false,
    //       "collapsed" : false,
    //       "nodes": []
    //     }
    //     ]
    //   },
    //   {
    //     "id": 21,
    //     "content": "21",
    //     "selected" : false,
    //     "collapsed" : false,
    //     "nodes": []
    //   },
    //   {
    //     "id": 22,
    //     "content": "22",
    //     "selected" : false,
    //     "collapsed" : false,
    //     "nodes": []
    //   }
    //   ]
    // },
    // {
    //   "id": 3,
    //   "content": "3",
    //   "selected" : false,
    //   "collapsed" : false,
    //   "nodes": []
    // },
    // {
    //   "id": 4,
    //   "content": "4",
    //   "selected" : false,
    //   "collapsed" : false,
    //   "nodes": []
    // }
    // ];
  });

})();
