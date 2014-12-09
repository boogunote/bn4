(function() {
  'use strict';

  angular.module('treesApp', ['ui.tree', 'firebase'])
  .controller('treesCtrl', function($scope, $firebase, $location) {
    $scope.noteId = $location.path().substring(1);
    if (!$scope.noteId) {
      window.location.replace("login.html");
    }

    localStorage.removeItem("clipboardData");

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

    var ref = new Firebase(window.firebase_url);
    var authData = ref.getAuth();
    if (authData) {
      // user authenticated with Firebase
      console.log(authData);
      //console.log(tree_url)
      $scope.commandList = []
      $scope.commandList.pos = -1;
      $scope.username = authData.uid;
      $scope.app_name = "boogunote";    
      $scope.base_url = window.firebase_url + "/" + $scope.username + "/" + $scope.app_name + "/notes/" +$scope.noteId;
      $scope.tree_url = $scope.base_url + "/tree";
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
    } else {
      window.location.replace("login.html")
    }

  });

})();
