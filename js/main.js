(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree', 'firebase'])
  .controller('treesCtrl', function($scope, $firebase) {
    localStorage.removeItem("clipboardData");

    $scope.username = "user1";
    $scope.app_name = "boogunote";    
    $scope.noteId = "note1";
    $scope.base_url = "https://boogu.firebaseio.com/" + $scope.username + "/" + $scope.app_name + "/notes/" +$scope.noteId;
    $scope.tree_url = $scope.base_url + "/tree";
    

    var diffTree = function(remote, local, path, applyChange) {
      // console.log("diffTree")
      // console.log(path)
      // console.log(remote)
      // console.log(local)
      if (!remote || !local) return;
      var changed = false;
      if (!remote.children){
        if (0 != local.children.length)
          changed = true;
        else
          changed = false
      } else {
        if (remote.children.length != local.children.length)
          changed = true;
        else {
          for (var i = 0; i < remote.children.length; i++) {
            if (remote.children[i].key != local.children[i].key) {
              changed = true;
              break;
            } else {
              
            }
          }
        }
      }

      if (changed) {
        applyChange(remote, local, path);
      } else {
        if (!!remote.children && !!local.children) {
          for (var i = 0; i < remote.children.length; i++) {
            diffTree(remote.children[i], local.children[i], path+"/children/"+i, applyChange);
          };
        }
      }
    }

    var addEmtpyChildrenArray = function(node) {
      if (!node) return;
      if (!node.children)
        node.children = [];
      else {
        for (var i = 0; i < node.children.length; i++) {
          addEmtpyChildrenArray(node.children[i])
        }
      }
    }

    var modifyLocalChildren_Remove = function(local, remote) {
      // console.log("modifyLocalChildren_Remove")
      // console.log(local)
      // console.log(remote)
      for (var i = 0; i < local.children.length; i++) {
        var found = false;
        for (var j = 0; j < remote.children.length; j++) {
          if (local.children[i].key == remote.children[j].key) {
            found = true;
            break;
          }
        }
        if (found) {
          modifyLocalChildren_Remove(local.children[i], remote.children[j]);
        } else {
          // console.log("remove node")
          // console.log(local.children)
          // console.log(i)
          local.children.splice(i, 1);
          i--;
          // console.log(local.children)
        }
      }
    }

    var modifyLocalChildren_Add = function(local, remote) {
      var list = [];
      // console.log("modifyLocalChildren_Add")
      // console.log(remote)
      // console.log(local)
      for (var i = 0; i < remote.children.length; i++) {
        var found = false;
        for (var j = 0; j < local.children.length; j++) {
          // console.log("local.children[j].key:" +local.children[j].key+ " remote.children[i].key:"+remote.children[i].key)
          if (local.children[j].key == remote.children[i].key) {
            found = true;
            break;
          }
        }

        if (!found)
          list.push(i)
        else
          modifyLocalChildren_Add(local.children[j], remote.children[i])
      }
      // console.log(list)
      for (var i = 0; i < list.length; i++) {
        local.children.splice(list[i], 0, remote.children[list[i]]);
      }
    }

    var syncRemoteToLocal = function(remote, local, path) {
      // console.log(remote)
      // console.log(local)
      addEmtpyChildrenArray(remote);
      // console.log("syncRemoteToLocal")
      // console.log(path)
      modifyLocalChildren_Remove(local, remote);
      // console.log("aaaaaaaaaaaaaaaaaaa")
      // console.log(local)
      // console.log(remote)
      modifyLocalChildren_Add(local, remote);
      // console.log("bbbbbbbbbbbbbbbbbbb")
      // console.log(local)
      // console.log(remote)
      // console.log("syncRemoteToLocal")
      // console.log(remote);
      // console.log(local);
      //local.children = remote.children;
      
    }

    var syncLocalToRemote = function(remote, local, path) {
      remote.children = local.children;
    }

    $scope.tree = {
      "name" : "",
      "children" : []
    };

    //console.log(tree_url)
    var remoteTree = $firebase(new Firebase($scope.tree_url)).$asObject();
    remoteTree.$loaded().then(function() {
      // console.log($scope.tree_url)
      // console.log(remoteTree)
      diffTree(remoteTree, $scope.tree, $scope.tree_url+"/children", syncRemoteToLocal);
      //console.log(remoteTree)
      //console.log($scope.tree)
      remoteTree.$watch(function(){
        // console.log("remote")
        diffTree(remoteTree, $scope.tree, $scope.tree_url+"/children", syncRemoteToLocal);
        //$scope.tree.children = remoteTree.children
      })

      // $scope.$watch(function() {
      //     return $scope.tree;
      //   }, 
      //   function(newVal, oldVal) {
      //   console.log("local")
      //   diffTree(remoteTree, $scope.tree, tree_url+"/children", syncLocalToRemote);
      //   console.log($scope.tree)
      // });
    });

    

    

// $scope.tree = {
//   "name": "",
//   "children": [
//     {
//       "children": [
//         {
//           "key": "node2",
//           "children": [
//             {
//               "key": "node4",
//               "children": [
//                 {
//                   "key": "node1",
//                   "children": []
//                 }
//               ]
//             }
//           ]
//         }
//       ],
//       "key": "node1"
//     },
//     {
//       "key": "node3",
//       "children": []
//     }
//   ]
// }

    // $scope.tree = [];
    // console.log($scope.base_url + "/trees/" + $scope.treeKey);
    // var remoteTree = $firebase(new Firebase($scope.base_url + "/trees/" + $scope.treeKey)).$asObject();

    // remoteTree.$loaded().then(function() {
    //   //console.log(remoteTree.children);
    //   remoteTree.$bindTo($scope, "tree").then(function() {
    //     console.log($scope.tree);
    //   });
    //   //for (var i = 0; i < remoteNodeKeyList.length; i++) {
    //     // var node_base_url = $scope.base_url + "/nodes/" + remoteNodeKeyList[i].$value;
    //     // var remoteNode = {
    //     //   content : $firebase(new Firebase(node_base_url + "/content")).$asObject(),
    //     //   collapsed : $firebase(new Firebase(node_base_url + "/collapsed")).$asObject(),
    //     //   children : $firebase(new Firebase(node_base_url + "/children")).$asArray()
    //     // }
    //     // $scope.tree.push({
    //     //   content : "",
    //     //   collapsed : false,
    //     //   children : [],
    //     //   remoteNode : remoteNode
    //     // });
    //     // $scope.tree.push(remoteNodeKeyList[i].$value);
    //     // console.log($scope.tree)
    //   //}
    // });

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
