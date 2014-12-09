(function() {
  'use strict';
  //console.log("sdsdf")
  var getUniqueId = function() {
    return Math.random().toString(36).substring(2)+"-"+new Date().getTime().toString()
  };
  angular.module('noteListApp', ['firebase'])
  .controller('noteListCtrl', function($scope, $firebase) {
  	var ref = new Firebase(window.firebase_url);

    $scope.createNewNote = function() {
      var note_name = prompt("Please enter the name for new note", "");
      if (null == note_name) return;

      var note_id = getUniqueId();
      var first_node_id = getUniqueId();
      var sync = $firebase(new Firebase($scope.base_url + "/notes"));
      var new_note_tree = 
        {
          "info" : {
            "name" : note_name
          },
          "nodes" : {
          },
          "tree" : {
            "children" : [ {
              "children" : [],
            } ]
          }
        };
      new_note_tree.nodes[first_node_id] = 
        {
          "collapsed" : false,
          "content" : ""
        };
      new_note_tree.tree.children[0].key = first_node_id
      console.log(new_note_tree)
      sync.$set(note_id, new_note_tree).then(function(ref) {
        //console.log("ref key(): " + ref.key());   // key for the new ly created record
      }, function(error) {
        console.log("Error:", error);
      });

      if (!$scope.note_list.list) {
        $scope.note_list.list = [];
      };

      $scope.note_list.list.unshift({
        "create_time" : new Date().getTime(),
        "id" : note_id
      })
    };

    $scope.inactiveShown = false;

    $scope.showInactiveList = function() {
      if (!$scope.inactiveShown) {
        $scope.inactiveShown = true;
        $scope.loadData();
      } else {
        $scope.inactiveShown = false;
        //$scope.noteListUnbind();
        //$scope.note_list.list = [];
      }
    }

    $scope.loadData = function() {
      var authData = ref.getAuth();
      if (authData) {
        // user authenticated with Firebase
        
        //console.log(tree_url)
        $scope.username = authData.uid;
        $scope.app_name = "boogunote";    
        $scope.noteId = "note1";
        $scope.base_url = window.firebase_url + "/" + $scope.username + "/" + $scope.app_name;
        $scope.list_url = $scope.base_url + "/note_list";
        if ($scope.active) {
          $scope.list_url = $scope.list_url + "/active";
        } else {
          $scope.list_url = $scope.list_url + "/inactive";
        }
        var noteList = $firebase(new Firebase($scope.list_url)).$asObject();
        noteList.$loaded().then(function() {
        	console.log(noteList)
        	//$scope.note_list = noteList;
        	$scope.noteListUnbind = noteList.$bindTo($scope, "note_list").then(function() {
        	});
        });
      } else {
        window.location.replace("login.html")
      }
    };
    setTimeout(function() {
      if ($scope.active) {
        $scope.loadData();
      };
    },0);
  })
  .controller('noteItemCtrl', function($scope, $firebase) {
  	if(!$scope.note_file) return;

    $scope.rename = function() {
      var name = prompt("Please enter the new name", $scope.info.name);
      if (!name) return;
      $scope.info.name = name;
    }

    $scope.remove = function() {
      if (!confirm("Delete Note: " + $scope.info.name)) return;

      for (var i = 0; i < $scope.note_list.list.length; i++) {
        if ($scope.note_list.list[i].id == $scope.note_file.id) {
          $scope.note_list.list.splice(i, 1);
          break;
        }
      };
      $firebase(new Firebase($scope.base_url + "/notes")).$remove($scope.note_file.id)
    }

    $scope.toggleActive = function() {
      if (!confirm("Deprecate Note: " + $scope.info.name)) return;

      var note = null;
      for (var i = 0; i < $scope.note_list.list.length; i++) {
        if ($scope.note_list.list[i].id == $scope.note_file.id) {
          note = $scope.note_list.list.splice(i, 1)[0];
          break;
        }
      };
      
      var targetListUrl = null;
      if ($scope.active) {
        var targetListUrl = $scope.base_url + "/note_list/inactive";
      } else {
        var targetListUrl = $scope.base_url + "/note_list/active";
      }
      var sync = $firebase(new Firebase(targetListUrl));
      var noteList = sync.$asObject();
      noteList.$loaded().then(function() {
        console.log(noteList)
        if (!noteList.list) {
          noteList.list = [];
        };

        noteList.list.unshift({
          "create_time" : note.create_time,
          "id" : note.id
        });

        sync.$set("list", noteList.list)
      });
    }

  	var ref = new Firebase(window.firebase_url);
    var authData = ref.getAuth();
    console.log(authData)
    if (authData) {
      $scope.aaa = $scope.note_file.id
  	  $scope.username = authData.uid;
      $scope.app_name = "boogunote";    
      $scope.noteId = "note1";
      $scope.base_url = window.firebase_url + "/" + $scope.username + "/" + $scope.app_name;
      $scope.note_item_info_url = $scope.base_url + "/notes/" + $scope.note_file.id + "/info";
      console.log($scope.note_item_info_url)
      var note_item_info = $firebase(new Firebase($scope.note_item_info_url)).$asObject();
      note_item_info.$loaded().then(function() {
      	console.log(note_item_info)
      	//$scope.aaa = note_item_info.$value
      	//$scope.note_list = noteList;
      	note_item_info.$bindTo($scope, "info").then(function() {
      		// console.log($scope.note_item_name)
      		// $scope.note_item = {};
      		// $scope.note_item.name = $scope.note_item_name
      	});
      });
    } else {
      window.location.replace("login.html")
    }
  });

})();