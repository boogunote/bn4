(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree', 'firebase'])
  .controller('treesCtrl', function($scope, $firebase) {
    localStorage.removeItem("clipboardData");

    $scope.username = "user1";
    $scope.app_name = "boogunote";    
    $scope.base_url = "https://boogu.firebaseio.com/" + $scope.username + "/" + $scope.app_name;
    $scope.treeKey = "tree_root_node";

    $scope.tree = [];
    // console.log($scope.base_url + "/nodes/" + $scope.treeKey + "/children");
    var remoteNodeKeyList = $firebase(new Firebase($scope.base_url + "/nodes/" + $scope.treeKey + "/children")).$asArray();
    remoteNodeKeyList.$loaded().then(function() {
      for (var i = 0; i < remoteNodeKeyList.length; i++) {
        // var node_base_url = $scope.base_url + "/nodes/" + remoteNodeKeyList[i].$value;
        // var remoteNode = {
        //   content : $firebase(new Firebase(node_base_url + "/content")).$asObject(),
        //   collapsed : $firebase(new Firebase(node_base_url + "/collapsed")).$asObject(),
        //   children : $firebase(new Firebase(node_base_url + "/children")).$asArray()
        // }
        // $scope.tree.push({
        //   content : "",
        //   collapsed : false,
        //   children : [],
        //   remoteNode : remoteNode
        // });
        $scope.tree.push(remoteNodeKeyList[i].$value);
        // console.log($scope.tree)
      }
    });

    // $scope.tree1 = [];
    // var temp_list = [];
    // $scope.username = "user1";
    // $scope.app_name = "boogunote";    
    // $scope.base_url = "https://boogu.firebaseio.com/" + $scope.username + "/" + $scope.app_name;

    // var url = $scope.base_url + "/trees";
    
    // $scope.trees = $firebase(new Firebase(url)).$asArray();
    // $scope.trees.$loaded().then(function() {
    //   //console.log($scope.trees[0])
    //   var id_list = $firebase(new Firebase($scope.base_url + "/nodes/" + $scope.trees[0].entry_point + "/children")).$asArray();
    //   var node_count = 0;
    //   id_list.$loaded().then(function() {
    //     for (var i = 0; i < id_list.length; i++) {
    //       console.log($scope.base_url + "/nodes/" + id_list[i].$value);
    //       var ref = new Firebase($scope.base_url + "/nodes/" + id_list[i].$value);
    //       var node = $firebase(ref).$asObject();
    //       node.$ref = ref;
    //       temp_list.push(node);
    //       node.$loaded().then(function() {
    //         node_count = node_count + 1;
    //         if (node_count == id_list.length) {
    //           for (var i = 0; i < temp_list.length; i++) {
    //             temp_list[i].collapsed = false;
    //             temp_list[i].selected = false;
    //             $scope.tree1.push({
    //               content : temp_list[i].content,
    //               collapsed : temp_list[i].collapsed,
    //               selected : false,
    //               children : temp_list[i].children,
    //               $remoteNode : temp_list[i]
    //             });
    //             //console.log(temp_list[i].node);
    //           };
    //         };
    //       })
    //     };
    //   });
    // });
    /*
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
    ];*/
  });

})();
