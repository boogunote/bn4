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
      console.log($scope.base_url)
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
  });

})();