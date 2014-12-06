(function() {
  'use strict';
  //console.log("sdsdf")
  angular.module('noteListApp', ['firebase'])
  .controller('noteListCtrl', function($scope, $firebase) {
  	var ref = new Firebase("https://boogu.firebaseio.com");
    var authData = ref.getAuth();
    if (authData) {
      // user authenticated with Firebase
      console.log(authData);
      //console.log(tree_url)
      $scope.username = authData.uid;
      $scope.app_name = "boogunote";    
      $scope.noteId = "note1";
      $scope.base_url = "https://boogu.firebaseio.com/" + $scope.username + "/" + $scope.app_name;
      $scope.list_url = $scope.base_url + "/note_list";
      var noteList = $firebase(new Firebase($scope.list_url)).$asObject();
      noteList.$loaded().then(function() {
      	console.log(noteList)
      	//$scope.note_list = noteList;
      	noteList.$bindTo($scope, "note_list").then(function() {
      	});
      });
    } else {
      window.location.replace("login.html")
    }
  })
  .controller('noteItemCtrl', function($scope, $firebase) {
  	if(!$scope.note_file) return;

  	var ref = new Firebase("https://boogu.firebaseio.com");
    var authData = ref.getAuth();
    if (authData) {
      $scope.aaa = $scope.note_file.id
  	  $scope.username = authData.uid;
      $scope.app_name = "boogunote";    
      $scope.noteId = "note1";
      $scope.base_url = "https://boogu.firebaseio.com/" + $scope.username + "/" + $scope.app_name;
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