(function() {
  'use strict';

  angular.module('ui.tree')

    .controller('TreeNodeController', ['$scope', '$element', '$attrs', 'treeConfig', '$uiTreeHelper', '$firebase',
      function ($scope, $element, $attrs, treeConfig, $uiTreeHelper, $firebase) {
        this.scope = $scope;

        $scope.$element = $element; // xgao: no use.
        $scope.$nodeElement = $element; // xgao: no use.
        $scope.$modelValue = undefined; // Model value for node;
        $scope.$parentNodeScope = undefined; // uiTreeNode Scope of parent node;
        $scope.$childNodesScope = undefined; // uiTreeNodes Scope of child nodes.
        $scope.$parentNodesScope = undefined; // uiTreeNodes Scope of parent nodes.
        $scope.$treeScope = undefined; // uiTree scope
        $scope.$handleScope = undefined; // it's handle scope
        $scope.$type = 'uiTreeNode';
        $scope.$$apply = false; // xgao: represent if it in a $apply function
        $scope.$dragInfo = undefined; // xgao: store info needed by drag. refer to helper.js dragInfo()

        //$scope.node.collapsed = false;
        $scope.expandOnHover = false;

        //$scope.node.selected = false;

        $scope.init = function(controllersArr) {
          $scope.$treeNodesCtrl = controllersArr[0];
          var treeNodesCtrl = controllersArr[0];
          $scope.$treeScope = controllersArr[1] ? controllersArr[1].scope : undefined;

          // find the scope of it's parent node
          $scope.$parentNodeScope = treeNodesCtrl.scope.$nodeScope;
          // modelValue for current node
          $scope.$modelValue = treeNodesCtrl.scope.$modelValue[$scope.$index];
          $scope.$parentNodesScope = treeNodesCtrl.scope;
          treeNodesCtrl.scope.initSubNode($scope); // init sub nodes

          //console.log($scope.node_key)

          var node_base_url = $scope.base_url + "/nodes";

          //You should put an empty node here. The binding will cause error without an empty child array.
           $scope.node = {
             content : "",
             collapsed : true,
          //   selected : false,
          //   children:[]
          };

          // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
          // console.log($scope.node_stub.key)
          // console.log($scope)

          $scope.children = $scope.node_stub.children;

          var node_url = node_base_url + "/" + $scope.node_stub.key;
          // if (!$scope.node_stub.children) {
          //   $scope.node_stub.children = [];
          //   $scope.$parentNodesScope.initSubNode($scope); // init sub nodes
          // };
          //$scope.children = $scope.node_stub.children;
          // console.log("dsdfsdfsdfdsfsdfsd: "+ node_url);
          // console.log($scope.node_stub);
          var node = $firebase(new Firebase(node_url)).$asObject();
          node.$loaded().then(function() {
            node.$bindTo($scope, "node").then(function() {
              //console.log($scope.node)
              // $scope.$watch(function() {
              //     return $scope.node.children
              //   }, 
              //   function(newVal, oldVal) {
              //     if (newVal != oldVal) {
              //     }
              //   });
              // node.$watch(function(){
              //   //console.log(node)
              // });
            });

            
          });

          $element.on('$destroy', function() {
            treeNodesCtrl.scope.destroySubNode($scope); // destroy sub nodes
          });
        };

        $scope.toggleSelected = function() {
          if ($scope.selected) {
            $scope.unselect();
          } else {
            $scope.select();
          }
        };

        $scope.select = function() {
          if (!$scope.selected) {
            $scope.selectNode();
            // console.log("select")
            // console.log($scope.node)
            //$scope.$treeScope.$selectedNodeScope.push($scope);
          }
        };

        $scope.unselect = function() {
          // console.log("unselect")
          // console.log($scope.$parentNodeScope.selected)
          // console.log($scope.selected)
          if (!$scope.$parentNodeScope || !$scope.$parentNodeScope.selected && $scope.selected) {
            $scope.unselectNode();
            var indexOf = $scope.$treeScope.$selectedNodeScope.indexOf($scope);
            if (angular.isDefined(indexOf) && indexOf > -1) {
              $scope.$treeScope.$selectedNodeScope.splice(indexOf, 1);
            }
          }
        };

        $scope.selectNode = function() {
          if (!$scope.selected) {
            //$scope.$childNodesScope.selected = true;
            $scope.selected = true;
            $scope.selectSubNode(true);
            //$scope.node.$parentNodesScope = $scope.$parentNodesScope;
          }
        };

        $scope.unselectNode = function() {
          // console.log("unselectNode")
          // console.log($scope.$parentNodeScope.selected)
          // console.log($scope.selected)
          if (!$scope.$parentNodeScope || !$scope.$parentNodeScope.selected && $scope.selected) {
            //$scope.$childNodesScope.selected = false;
            $scope.selected = false;
            $scope.selectSubNode(false);
            //$scope.node.$parentNodesScope = undefined;
          }
        };

        $scope.selectSubNode = function(select) {
          var childNodes = $scope.childNodes();
          for (var i = childNodes.length - 1; i >= 0; i--) {
            if (select) {
              childNodes[i].selectNode();
            } else {
              childNodes[i].unselectNode();
            }
            childNodes[i].selectSubNode(select);
          };
        }

        $scope.newSubItem = function(scope) {
          // console.log($scope)
          var positionArray = $scope.$treeScope.getPositionArray($scope, $scope.$treeScope);
          positionArray.push(0)
          console.log(positionArray)
          var nodeData = {
            positionArray : positionArray,
            key : $uiTreeHelper.getUniqueId(),
            content : "",
            collapsed : false,
            icon : "",
            children : []
          }
          $scope.$treeScope.insertNodeAt(nodeData, positionArray, $scope.$treeScope);
          $scope.$treeScope.record([nodeData], "insert");
          return nodeData;
          // //console.log(JSON.stringify($scope.tree))
          // // if (!$scope.$childNodesScope.$modelValue) {
          // //   $scope.$childNodesScope.$modelValue = [];
          // //   $scope.$parentNodesScope.initSubNode($scope); // init sub nodes
          // // }
          // //console.log("newSubItem: " + JSON.stringify($scope.$childNodesScope.$modelValue, null, 2))
          // setTimeout(function(){
          //   $scope.addNewItem($scope.$childNodesScope, 0, {
          //     content : "",
          //     collapsed : false,
          //   });
          // }, 0);
        };

        $scope.newSiblingNode = function(next) {
          // var index = $scope.index();
          // var position = -1;
          // if (next) {
          //   position = index+1;
          // } else {
          //   position = index;
          // }
          // console.log($scope);
          // $scope.addNewItem($scope.$parentNodesScope, position, {
          //   content : "",
          //   collapsed : false,
          // });
          var positionArray = $scope.$treeScope.getPositionArray($scope, $scope.$treeScope);
          positionArray[positionArray.length-1]++;
          var nodeData = {
            positionArray : positionArray,
            key : $uiTreeHelper.getUniqueId(),
            content : "",
            collapsed : false,
            icon : "",
            children : []
          }
          $scope.$treeScope.insertNodeAt(nodeData, positionArray, $scope.$treeScope);
          $scope.$treeScope.record([nodeData], "insert");
          return nodeData;
        };

        $scope.onKeyDown = function(scope, $event) {
          console.log($event.keyCode);
          $event.returnValue = false;
          if ($event.shiftKey && 13 == $event.keyCode) {
            var nodeData = scope.newSubItem(scope);
            setTimeout(function(){
              $scope.$treeScope.focusNodeAt(nodeData.positionArray);
            }, 0);

            // setTimeout(function(){
            //   $scope.focusNode($scope.$childNodesScope, node.$$hashKey);
            // }, 0);
            
            $event.cancelBubble = true;
          } else if (13 == $event.keyCode) {
            //console.log($event)
            var direction = null;
            if ($event.ctrlKey) {
              direction = true;
            } else if ($event.altKey) {
              direction = false;
            }
            if (null != direction) {
              var nodeData = $scope.newSiblingNode(direction);
              setTimeout(function(){
                $scope.$treeScope.focusNodeAt(nodeData.positionArray);
              }, 0);
              // var node = $scope.newSiblingNode(direction);
              // setTimeout(function(){
              //   $scope.focusNode($scope.$parentNodesScope, node.$$hashKey);
              // }, 0);

              $event.cancelBubble = true;
            }
          } else {
            $event.returnValue = true;
          }
        };

        $scope.onClick = function(scope, $event) {
          //console.log($event);
          if ($event.ctrlKey) {
            scope.toggleSelected();
            $event.returnValue = false;
          }
        };

        $scope.index = function() {
          var nodesScope = !!$scope.$parentNodesScope?$scope.$parentNodesScope:$scope.$treeScope.$childNodesScope;
          return nodesScope.$modelValue.indexOf($scope.$modelValue);
        };

        $scope.dragEnabled = function() {
          return !($scope.$treeScope && !$scope.$treeScope.dragEnabled);
        };

        $scope.isSibling = function(targetNode) {
          return $scope.$parentNodesScope === targetNode.$parentNodesScope;
        };

        $scope.isChild = function(targetNode) {
          var nodes = $scope.childNodes();
          return nodes && nodes.indexOf(targetNode) > -1;
        };

        $scope.prev = function() {
          var index = $scope.index();
          if (index > 0) {
            return $scope.siblings()[index - 1];
          }

          return undefined;
        };

        $scope.siblings = function() {
          return $scope.$parentNodesScope.childNodes();
        };

        $scope.childNodesCount = function() {
          return (angular.isDefined($scope.childNodes())) ? $scope.childNodes().length : 0;
        };

        $scope.hasChild = function() {
          return $scope.childNodesCount() > 0;
        };

        $scope.childNodes = function() {
          return (angular.isDefined($scope.$childNodesScope) && angular.isDefined($scope.$childNodesScope.$modelValue)) ?
                 $scope.$childNodesScope.childNodes() : undefined;
        };

        $scope.accept = function(sourceNode, destIndex) {
          return angular.isDefined($scope.$childNodesScope) &&
                  angular.isDefined($scope.$childNodesScope.$modelValue) &&
                  $scope.$childNodesScope.accept(sourceNode, destIndex);
        };

        $scope.isLastNode = function() {
          if ($scope.tree.children.length ==1 && $scope.node_stub.key == $scope.tree.children[0].key) {
            $scope.deleteTreeContent($scope.tree.children[0])
            $scope.tree.children[0].children = [];
            $scope.syncNodesToRemote($scope.$childNodesScope);
            return true;
          } else
            return false;
        }

        $scope.remove = function() {
          // if ($scope.isLastNode()) return;
          //$scope.deleteNodeList([$scope]);
          var positionArray = $scope.$treeScope.getPositionArray($scope, $scope.$treeScope);
          var nodeData = $scope.$treeScope.removeNodeAt(positionArray, $scope.$treeScope);
          $scope.$treeScope.record([nodeData], "remove");
          
        };

        $scope.toggle = function() {
          $scope.node.collapsed = !$scope.node.collapsed;
        };

        $scope.collapse = function(all) {
          $scope.node.collapsed = $scope.$treeScope.$callbacks.collapse($scope, all);
        };

        $scope.expand = function(all) {
          $scope.node.collapsed = !$scope.$treeScope.$callbacks.expand($scope, all);
        };

        $scope.depth = function() {
          var parentNode = $scope.$parentNodeScope;
          if (parentNode) {
            return parentNode.depth() + 1;
          }

          return 1;
        };

        var subDepth = 0;
        var countSubDepth = function(scope) {
          var count = 0;
          var nodes = scope.childNodes();
          for (var i = 0; i < nodes.length; i++) {
            var childNodes = nodes[i].$childNodesScope;
            if (childNodes) {
              count = 1;
              countSubDepth(childNodes);
            }
          }
          subDepth += count;
        };

        $scope.maxSubDepth = function() {
          subDepth = 0;
          if ($scope.$childNodesScope) {
            countSubDepth($scope.$childNodesScope);
          }

          return subDepth;
        };
      }
    ]);
})();
