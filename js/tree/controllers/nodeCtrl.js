(function() {
  'use strict';

  angular.module('ui.tree')

    .controller('TreeNodeController', ['$scope', '$element', '$attrs', 'treeConfig', '$uiTreeHelper', 
      function ($scope, $element, $attrs, treeConfig, $uiTreeHelper) {
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

          $element.on('$destroy', function() {
            treeNodesCtrl.scope.destroySubNode($scope); // destroy sub nodes
          });
        };

        $scope.toggleSelected = function() {
          if ($scope.node.selected) {
            $scope.unselect();
          } else {
            $scope.select();
          }
        };

        $scope.select = function() {
          if (!$scope.node.selected && $scope.$treeScope.$callbacks.select($scope)) {
            $scope.selectNode();
            $scope.$treeScope.$selecteds.push($scope.node);
          }
        };

        $scope.unselect = function() {
          if (!$scope.$parentNodesScope.selected && $scope.node.selected && $scope.$treeScope.$callbacks.unselect($scope)) {
            $scope.unselectNode();
            var indexOf = $scope.$treeScope.$selecteds.indexOf($scope.node);
            if (angular.isDefined(indexOf) && indexOf > -1) {
              $scope.$treeScope.$selecteds.splice(indexOf, 1);
            }
          }
        };

        $scope.selectNode = function() {
          if (!$scope.node.selected && $scope.$treeScope.$callbacks.select($scope)) {
            $scope.$childNodesScope.selected = true;
            $scope.selectSubNode(true);
            $scope.node.selected = true;
            $scope.node.$parentNodesScope = $scope.$parentNodesScope;
          }
        };

        $scope.unselectNode = function() {
          if (!$scope.$parentNodesScope.selected && $scope.node.selected && $scope.$treeScope.$callbacks.unselect($scope)) {
            $scope.$childNodesScope.selected = false;
            $scope.selectSubNode(false);
            $scope.node.selected = false;
            $scope.node.$parentNodesScope = undefined;
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

        $scope.createContentNode = function(selected_node) {
          var node = {};
          node.content = selected_node.content;
          node.selected = selected_node.selected;
          node.collapsed = selected_node.collapsed;
          node.nodes = [];
          for (var i = 0; i < selected_node.nodes.length; i++) {
            node.nodes.push($scope.createContentNode(selected_node.nodes[i]));
          };
          return node;
        }

        $scope.copy = function () {
          console.log($scope.$treeNodesCtrl.scope.$modelValue[0] === $scope.$treeScope.$selecteds[0]);
          var selectedNodes = [];
          for (var i = 0; i < $scope.$treeScope.$selecteds.length; i++) {
            selectedNodes.push($scope.createContentNode($scope.$treeScope.$selecteds[i]))
          };
          delete localStorage.clipboardData;
          localStorage.clipboardData = undefined;
          localStorage.clipboardData = JSON.stringify(selectedNodes);
          console.log(JSON.stringify(localStorage.clipboardData));
        }

        $scope.paste = function() {
          var clipboardData = localStorage.getItem("clipboardData");
          if (!clipboardData) return;

          var pasteData = JSON.parse(clipboardData);

          for (var i = 0; i < $scope.$treeScope.$selecteds.length; i++) {
            $scope.$treeScope.$selecteds[i].selected = false;
            $uiTreeHelper.cleanSubNodeStatus($scope.$treeScope.$selecteds[i]);
          };

          for (var i = 0, index = $scope.index(); i < pasteData.length; i++) {
           $scope.$parentNodesScope.insertNode(index+i+1, pasteData[i]);
          };
          $scope.$treeScope.$selecteds = pasteData;
        }

        $scope.newSubItem = function(scope) {
          var nodeData = scope.$modelValue;
          var node = {
            content: "",
            nodes: []
          };
          nodeData.nodes.splice(0, 0, node);
          return node;
        };

        $scope.focusNode = function(nodesScope, hashKey) {
          var nodeScope = nodesScope.getSubNode(hashKey);
          console.log(nodeScope.$element[0]);
          nodeScope.$element[0].childNodes[1].childNodes[3].childNodes[5].focus();
        }

        $scope.newSiblingNode = function(next) {
          var node = {
            content: "",
            nodes: []
          };
          var index = $scope.index();
          console.log($scope.$parentNodesScope.$modelValue);
          var position = -1;
          if (next) {
            position = index+1;
          } else {
            position = index;
          }
          $scope.$parentNodesScope.$modelValue.splice(position, 0, node);
          return node;
        };

        $scope.deleteSelectNodes = function() {
          for (var i = 0; i < $scope.$treeScope.$selecteds.length; i++) {
            $scope.$treeScope.$selecteds[i].$parentNodesScope.removeNode($scope.$treeScope.$selecteds[i]);
          };
          
        }

        $scope.onKeyDown = function(scope, $event) {
          //console.log($event.keyCode);
          $event.returnValue = false;
          if ($event.shiftKey && 13 == $event.keyCode) {
            var node = scope.newSubItem(scope);
            setTimeout(function(){
              $scope.focusNode($scope.$childNodesScope, node.$$hashKey);
            }, 0);
            
            $event.cancelBubble = true;
          } else if (13 == $event.keyCode) {
            var direction = null;
            if ($event.ctrlKey) {
              direction = true;
            } else if ($event.ctrlKey) {
              direction = false;
            }
            var node = $scope.newSiblingNode(direction);
            setTimeout(function(){
              $scope.focusNode($scope.$parentNodesScope, node.$$hashKey);
            }, 0);

            $event.cancelBubble = true;
          } else if ($event.ctrlKey && 67 == $event.keyCode) {
            if (0 < $scope.$treeScope.$selecteds.length) {
              console.log($scope.$treeScope.$selecteds);
              $scope.copy();
            }
          } else if ($event.ctrlKey && $event.shiftKey && 86 == $event.keyCode) {
            $scope.paste();
            $event.cancelBubble = true;
          } else if ($event.ctrlKey && 46 == $event.keyCode) {
            $scope.deleteSelectNodes();
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
          return $scope.$parentNodesScope.$modelValue.indexOf($scope.$modelValue);
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

        $scope.removeNode = function() {
          if ($scope.$treeScope.$callbacks.remove(node)) {
            var node = $scope.remove();

            return node;
          }

          return undefined;
        };

        $scope.remove = function() {
          return $scope.$parentNodesScope.removeNode($scope.$modelValue);
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
