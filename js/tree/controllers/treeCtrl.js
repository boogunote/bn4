(function() {
  'use strict';

  angular.module('ui.tree')
    .controller('TreeController', ['$scope', '$element', '$window', '$attrs', 'treeConfig', 'keys', '$uiTreeHelper', '$firebase', '$location',
      function ($scope, $element, $window, $attrs, treeConfig, keys, $uiTreeHelper, $firebase, $location) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$treeElement = $element;
        $scope.$childNodesScope = undefined; // root nodes
        $scope.$type = 'uiTree';
        $scope.$emptyElm = undefined;
        $scope.$callbacks = undefined;

        $scope.$selectedNodeScope = [];
        $scope.$operationRecordList = [];
        $scope.$operationRecordList.cursor = -1;

        $scope.dragEnabled = (angular.isUndefined($scope.dragEnabled)) ? true : $scope.dragEnabled;
        $scope.emptyPlaceholderEnabled = (angular.isUndefined($scope.emptyPlaceholderEnabled)) ? false : $scope.emptyPlaceholderEnabled;
        $scope.maxDepth = (angular.isUndefined($scope.maxDepth)) ? 10 : $scope.maxDepth;
        $scope.dragDelay = (angular.isUndefined($scope.dragDelay)) ? 0 : $scope.dragDelay;
        $scope.dragDistance = (angular.isUndefined($scope.dragDistance)) ? 0 : $scope.dragDistance;
        $scope.cancelKey = keys.escape;
        $scope.lockXKey = undefined;
        $scope.lockX = false;
        $scope.lockYKey = undefined;
        $scope.lockY = false;
        $scope.boundTo = (angular.isUndefined($scope.boundTo)) ? '' : $scope.boundTo;
        $scope.collideWith = 'bottom';
        $scope.coverage = 0.5;
        $scope.spacing = 0; //(angular.isUndefined($scope.spacing)) ? 50 : $scope.spacing;
        $scope.spacingThreshold = Math.floor($scope.spacing / 4);

        $scope.copyKey = undefined;
        $scope.copy = false;
        $scope.multiSelectKey = undefined;
        $scope.multiSelect = false;

        $scope.expandOnHover = (angular.isUndefined($scope.expandOnHover)) ? 500 : $scope.expandOnHover;

        $scope.$watch('callbacks', function(newOptions) {
          angular.forEach(newOptions, function(value, key) {
            if ($scope.$callbacks[key]) {
              if (angular.isFunction(value)) {
                $scope.$callbacks[key] = value;
              }
            }
          });
        }, true);

        $scope.$watch('$childNodesScope.$modelValue.length', function() {
          if ($scope.$childNodesScope.$modelValue) {
            $scope.resetEmptyElement();
          }
        }, true);

        $scope.$watch('lockXKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.lockXKey = (angular.isDefined(keys[val])) ? keys[val] : (val.length === 1) ? (val.charCodeAt(0) - 32) : undefined;
            }
          }

          $scope.lockX = (angular.isUndefined($scope.lockXKey) && ((typeof val) === 'boolean')) ? val : false;
        });

        $scope.$watch('lockYKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.lockYKey = (angular.isDefined(keys[val])) ? keys[val] : (val.length === 1) ? (val.charCodeAt(0) - 32) : undefined;
            }
          }

          $scope.lockY = (angular.isUndefined($scope.lockXKey) && ((typeof val) === 'boolean')) ? val : false;
        });

        $scope.$watch('boundToString', function(val) {
          if (angular.isString(val) && val.length > 0) {
            try {
              $scope.boundTo = angular.element($window.document.querySelectorAll(val));
            } catch (exception) {
              $scope.boundTo = '';
            }
          }
        });

        $scope.$watch('spacing', function(val) {
          if (angular.isNumber(val) && val > 0) {
            $scope.spacingThreshold = Math.floor($scope.spacing / 4);
          }
        });

        $scope.$watch('coveragePercent', function(val) {
          if (angular.isNumber(val) && val >= -100 && val <= 100) {
            $scope.collideWith = (val < 0) ? 'top' : 'bottom';
            $scope.coverage = Math.abs((val / 100));
          }
        });

        $scope.$watch('cancelKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.cancelKey = (angular.isDefined(keys[val])) ? keys[val] : (val.charCodeAt(0) - 32);
            }
          }
        });

        $scope.$watch('copyKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.copyKey = (angular.isDefined(keys[val])) ? keys[val] : (val.charCodeAt(0) - 32);
            }
          }
        });

        $scope.$watch('selectKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.multiSelectKey = (angular.isDefined(keys[val])) ? keys[val] : (val.charCodeAt(0) - 32);
            }
          }
        });

        // Check if it's a empty tree
        $scope.isEmpty = function() {
          return ($scope.$childNodesScope && $scope.$childNodesScope.$modelValue && $scope.$childNodesScope.$modelValue.length === 0);
        };

        // add placeholder to empty tree
        $scope.place = function(placeElm) {
          $scope.$childNodesScope.$element.append(placeElm);
          $scope.$emptyElm.remove();
        };

        $scope.resetEmptyElement = function() {
          if ($scope.$childNodesScope.$modelValue.length === 0 && $scope.emptyPlaceholderEnabled) {
            $element.append($scope.$emptyElm);
          } else {
            $scope.$emptyElm.remove();
          }
        };

        var collapseOrExpand = function(scope, collapsed) {
          var nodes = scope.childNodes();
          for (var i = 0; i < nodes.length; i++) {
            (collapsed) ? nodes[i].collapse(true) : nodes[i].expand(true);

            var subScope = nodes[i].$childNodesScope;
            if (subScope) {
              collapseOrExpand(subScope, collapsed);
            }
          }
        };

        $scope.collapseAll = function() {
          collapseOrExpand($scope.$childNodesScope, true);
        };
        $scope.$on('collapseAll', $scope.collapseAll);

        $scope.expandAll = function() {
          collapseOrExpand($scope.$childNodesScope, false);
        };
        $scope.$on('expandAll', $scope.expandAll);

        console.log($location)
        $scope.noteId = $location.path().substring(1);
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
        } else {
          window.location.replace("login.html")
        }


        $scope.clearNodeState = function() {
          var visite = function(nodeScope) {
            nodeScope.selected = false;
            var childNodeList = nodeScope.$childNodesScope.childNodes();
            for (var i = 0; i < childNodeList.length; i++) {
              visite(childNodeList[i])
            }
          }
          visite($scope);
        }

        $scope.getPositionArray = function(nodeScope, rootScope) {
          var positionArray = [];
          var currentScope = nodeScope;
          // currentScope is null or undefined means touch the root.
          while(currentScope && currentScope != rootScope) {
            console.log(currentScope)
            var index = currentScope.$parentNodesScope.$modelValue.indexOf(currentScope.$modelValue);
            positionArray.unshift(index)
            currentScope = currentScope.$parentNodeScope;
          }
          return positionArray;
        }

        $scope.getScopeByPositionArray = function(positionArray, rootScope) {
          if (!rootScope) rootScope = $scope;
          // console.log("getScopeByPositionArray")
          // console.log(positionArray)
          // console.log(rootScope)
          if (!positionArray || 0 == positionArray.length) return rootScope; // level 1

          var currentScope = rootScope;
          for (var i = 0; i < positionArray.length; i++) {
            // console.log(currentScope);
            // console.log(currentScope.$childNodesScope.childNodes())
            currentScope = currentScope.$childNodesScope.childNodes()[positionArray[i]];
          }

          return currentScope;
        }

        $scope.syncNodeToRemote = function(nodeScope) {
          var nodesScope = nodeScope.$childNodesScope;
          var path= "";
          var currentScope = nodesScope.$nodeScope;
          while(currentScope) {
            //console.log("wawa")
            var nodes = currentScope.$parentNodesScope.$modelValue;
            var index = -1;
            for (var i = 0; i < nodes.length; i++) {
              //console.log("nodes[i].key:"+nodes[i].key + " currentScope.node_stub.key:" + currentScope.node_stub.key)
              if (nodes[i].key == currentScope.node_stub.key) {
                index = i;
                break;
              }
            };
            //var index = currentScope.$parentNodesScope.$modelValue.indexOf(currentScope.node);
            //console.log("index:"+index);
            path = "/children/" +index + path;
            currentScope = currentScope.$parentNodeScope;
            //if (!currentScope) break;
          }
          //console.log("ddddddddddddddddddddddd")
          //console.log($scope.tree_url+path)
          var sync = $firebase(new Firebase($scope.tree_url+path));
          //console.log(scope.$nodeScope.node_stub)
          var clone_tree = function(old_tree) {
            var new_tree = {
              key : !!old_tree.key?old_tree.key:null,
              children : []
            };
            for (var i = 0; !!old_tree.children && i < old_tree.children.length; i++) {
              new_tree.children.push(clone_tree(old_tree.children[i]))
            }
            return new_tree;
          };
          var new_tree = null;
          // Check if at tree root node.
          if (!!nodesScope.$nodeScope) {
            sync.$set(clone_tree(nodesScope.$nodeScope.node_stub));
          } else {
            sync.$set(clone_tree($scope.tree));
          }
          //console.log(new_tree)
          
        }

        $scope.insertNodeAt = function(nodeData, positionArray, rootScope) {
          var parentPositionArray = positionArray.slice(0,-1)
          var parentNodeScope = $scope.getScopeByPositionArray(parentPositionArray, rootScope);
          var nodeList = [];
          var createNodeStub = function(_nodeData) {
            var _nodeStub = {
              key : _nodeData.key,
              children : []
            };
            for (var i = 0; i < _nodeData.children.length; i++) {
              _nodeStub.children.push(createNodeStub(_nodeData.children[i]))
            }
            var node = {
              content : _nodeData.content,
              collapsed : _nodeData.collapsed,
              icon : !!_nodeData.icon?_nodeData.icon:null
            }

            console.log(node)
            var sync = $firebase(new Firebase($scope.base_url + "/nodes"));
            sync.$set(_nodeData.key, node).then(function(ref) {
            }, function(error) {
              console.log("Error:", error);
            });

            return _nodeStub;
          }
          

          var insertPosition = positionArray[positionArray.length-1];
          
          parentNodeScope.$childNodesScope.$modelValue.splice(insertPosition, 0, createNodeStub(nodeData));
          // setTimeout(function(){
          //   console.log("setTimeout(function() {}, 10);");
          //   console.log(parentNodeScope.$childNodesScope.childNodes()[insertPosition])
          //   parentNodeScope.$childNodesScope.childNodes()[insertPosition].node_stub = nodeStub;
          // }, 0);



          $scope.syncNodeToRemote(parentNodeScope);
        }

        // $scope.insertTreeAt = function(nodeData, rootScope, positionArray) {
        // }

        $scope.removeNodeAt = function(positionArray, rootScope) {
          var parentPositionArray = positionArray.slice(0,-1)
          var parentNodeScope = $scope.getScopeByPositionArray(parentPositionArray, rootScope);
          var nodeScope = $scope.getScopeByPositionArray(positionArray, rootScope);

          var nodeData = {
            positionArray : positionArray,
            key : nodeScope.node_stub.key,
            content : nodeScope.node.content,
            collapsed : nodeScope.node.collapsed,
            icon : nodeScope.node.icon,
            children : []
          }

          var childNodeScopeList = nodeScope.$childNodesScope.childNodes();
          console.log(childNodeScopeList)
          for (var i = childNodeScopeList.length - 1; i >= 0; i--) {
//          for (var i = 0; i < childNodeScopeList.length; i++) {
            nodeData.children.unshift($scope.removeNodeAt(positionArray.concat(i), rootScope))
          }

          var sync = $firebase(new Firebase($scope.base_url + "/nodes"));
          sync.$set(nodeScope.node_stub.key, null).then(function(ref) {
            //console.log("ref key(): " + ref.key());   // key for the new ly created record
          }, function(error) {
            console.log("Error:", error);
          });

          var nodeSub = parentNodeScope.$childNodesScope.$modelValue.splice(positionArray[positionArray.length-1], 1);

          $scope.syncNodeToRemote(parentNodeScope);

          return nodeData;
        }

        $scope.focusNodeAt = function(positionArray, rootScope) {
          if (!rootScope) rootScope = $scope;

          var nodeScope = $scope.getScopeByPositionArray(positionArray, rootScope);
          console.log("focusNodeAt")
          console.log(nodeScope)
          if (nodeScope)
            nodeScope.$element[0].childNodes[1].childNodes[1].childNodes[5].focus();
        }

        $scope.record = function(nodeDataList, operation) {
          var record = {};
          record.operation = operation;
          record.nodeList = nodeDataList;
          
          $scope.$operationRecordList.splice($scope.$operationRecordList.cursor+1);
          $scope.$operationRecordList.push(record);
          $scope.$operationRecordList.cursor++;
          //console.log($scope.$operationRecordList)
        }

        $scope.getNodeScopeByKey = function (key, rootScope) {
          var childScopeList = rootScope.$childNodesScope.childNodes()
          // console.log(childScopeList)
          for (var i = 0; i < childScopeList.length; i++) {
            // console.log(childScopeList[i].node_stub.key +" | "+ key)
            if (childScopeList[i].node_stub.key == key)
              return childScopeList[i];
            else {
              var targetScope = $scope.getNodeScopeByKey(key, childScopeList[i]);
              if (!!targetScope) return targetScope;
            }
          }

          return null;
        }

        $scope.undo = function() {
          console.log($scope.$operationRecordList)
          if ($scope.$operationRecordList.cursor < 0) return;

          var copyContent = function (node) {
            // console.log("copyContent")
            // console.log(node)
            //node.content = $scope.getScopeByPositionArray($scope, positionArray).node.content;
            var nodeScope = $scope.getNodeScopeByKey(node.key, $scope);
            if (!!nodeScope) {
              node.content = nodeScope.node.content;
              for (var i = 0; i < node.children.length; i++) {
                copyContent(node.children[i]);
              }
            }
          }
          for (var i = 0; i <= $scope.$operationRecordList.cursor; i++) {
            var record = $scope.$operationRecordList[i];
            if ("insert" == record.operation) {
              for (var j = 0; j < record.nodeList.length; j++) {
                console.log("record.nodeList[j]")
                console.log(record.nodeList[j])
                copyContent(record.nodeList[j]);
              };
            };
          };
          var record = $scope.$operationRecordList[$scope.$operationRecordList.cursor];
          $scope.$operationRecordList.cursor--;

          if ("insert" == record.operation) {
            for (var i = record.nodeList.length - 1; i >= 0; i--) {
              $scope.removeNodeAt(record.nodeList[i].positionArray, $scope);
            }
          } else if ("remove" == record.operation) {
            for (var i = record.nodeList.length - 1; i >= 0; i--) {
              console.log(record.nodeList[i]);
              $scope.insertNodeAt(record.nodeList[i], record.nodeList[i].positionArray, $scope);
            }
            setTimeout(function() {
              for (var i = 0; i < record.nodeList.length; i++) {
                $scope.getScopeByPositionArray(record.nodeList[i].positionArray).select();
              };
            }, 0);
          }
        }

        $scope.redo = function() {
          console.log($scope.$operationRecordList)
          if ($scope.$operationRecordList.cursor >= $scope.$operationRecordList.length-1) return;

          $scope.$operationRecordList.cursor++;
          var record = $scope.$operationRecordList[$scope.$operationRecordList.cursor];

          if ("insert" == record.operation) {
            for (var i = 0; i < record.nodeList.length; i++) {
              console.log(record.nodeList[i]);
              $scope.insertNodeAt(record.nodeList[i], record.nodeList[i].positionArray, $scope);
            }
            setTimeout(function() {
              for (var i = 0; i < record.nodeList.length; i++) {
                $scope.getScopeByPositionArray(record.nodeList[i].positionArray).select();
              };
            }, 0);
          } else if ("remove" == record.operation) {
            for (var i = 0; i < record.nodeList.length; i++) {
              $scope.removeNodeAt(record.nodeList[i].positionArray, $scope);
            }
          }
        }

        $scope.getSelectedNodeScopeList = function() {
          var selectedNodeList = [];
          var visite = function(nodeScope) {
            if (nodeScope.selected) {
              selectedNodeList.push(nodeScope);
            } else {
              var childNodeList = nodeScope.$childNodesScope.childNodes();
              for (var i = 0; i < childNodeList.length; i++) {
                visite(childNodeList[i])
              };
            }
          }
          visite($scope);
          return selectedNodeList;
        }

        $scope.delete = function(isOperateFocused) {
          var selectedNodeScopeList = $scope.getSelectedNodeScopeList();
          if (isOperateFocused && 0 >= selectedNodeScopeList.length && !!$scope.focusedNodeScope) 
            selectedNodeScopeList.push($scope.focusedNodeScope);
          var recordNodeList = [];
          for (var i = 0; i < selectedNodeScopeList.length; i++) {
            var positionArray = $scope.getPositionArray(selectedNodeScopeList[i], $scope);
            var nodeData = $scope.removeNodeAt(positionArray, $scope);
            recordNodeList.push(nodeData)
          };
          $scope.record(recordNodeList, "remove");
        }

        $scope.copy = function(isOperateFocused) {
          var selectedNodeScopeList = $scope.getSelectedNodeScopeList();
          if (isOperateFocused && 0 >= selectedNodeScopeList.length && !!$scope.focusedNodeScope) 
            selectedNodeScopeList.push($scope.focusedNodeScope);
          var visite = function(nodeScope) {
            var nodeData = {
              key : nodeScope.node_stub.key,
              content : nodeScope.node.content,
              collapsed : nodeScope.node.collapsed,
              icon : nodeScope.node.icon,
              children : []
            }
            var childNodeList = nodeScope.$childNodesScope.childNodes();
            for (var i = 0; i < childNodeList.length; i++) {
              nodeData.children.push(visite(childNodeList[i]));
            }
            return nodeData;
          }
          
          var copiedNodeList = [];
          for (var i = 0; i < selectedNodeScopeList.length; i++) {
            var nodeData = visite(selectedNodeScopeList[i]);
            copiedNodeList.push(nodeData);
          }

          delete localStorage.clipboardData;
          localStorage.clipboardData = undefined;
          localStorage.clipboardData = JSON.stringify(copiedNodeList);
        }

        $scope.paste = function(positionArray) {
          console.log("$scope.paste = function(positionArray) {")
          console.log(positionArray)
          var clipboardData = localStorage.getItem("clipboardData");
          if (!clipboardData) return;

          var pasteData = JSON.parse(clipboardData);

          var visite = function(nodeData) {
            nodeData.key = $uiTreeHelper.getUniqueId();
            for (var i = 0; i < nodeData.children.length; i++) {
              nodeData.children[i].positionArray = nodeData.positionArray.concat(i);
              visite(nodeData.children[i]);
            }
          }

          for (var i = 0; i < pasteData.length; i++) {
            pasteData[i].positionArray = positionArray.slice();
            pasteData[i].positionArray[pasteData[i].positionArray.length-1] = positionArray[positionArray.length-1] + i;
            console.log(pasteData[i].positionArray)
            visite(pasteData[i]);
          }

          var parentPositionArray = positionArray.slice(0,-1)
          var parentNodeScope = $scope.getScopeByPositionArray(parentPositionArray, $scope);
          var insertPosition = positionArray[positionArray.length-1];
          for (var i = 0; i < pasteData.length; i++) {
            console.log(pasteData[i].positionArray)
            $scope.insertNodeAt(pasteData[i], pasteData[i].positionArray, $scope);
          }

          $scope.record(pasteData, "insert");
        }

        $scope.stepIcon = function(direction) {
          if (!$scope.focusedNodeScope) return;
          if (direction)
            $scope.focusedNodeScope.node.icon++;
          else
            $scope.focusedNodeScope.node.icon--;
          if ($scope.focusedNodeScope.node.icon>7) $scope.focusedNodeScope.node.icon = 0;
          if ($scope.focusedNodeScope.node.icon<0) $scope.focusedNodeScope.node.icon = 7;
        }

        $scope.onKeyDown = function($event) {
          console.log($event.keyCode);
          $uiTreeHelper.safeApply($scope, function() {
            $event.returnValue = false;
            if (27 == $event.keyCode) {
              $scope.clearNodeState();
              $event.returnValue = true;
            } else if ($event.ctrlKey && $event.shiftKey &&  67 == $event.keyCode) {
              $scope.copy(true);
            } else if ($event.ctrlKey && 46 == $event.keyCode) {
              $scope.delete(true);
            } else if ($event.ctrlKey && $event.shiftKey && 88 == $event.keyCode) {
              $scope.copy(true);
              $scope.delete(true);
            } else if ($event.ctrlKey && $event.shiftKey && 90 == $event.keyCode) {
              $scope.undo();
            } else if ($event.ctrlKey && $event.shiftKey && 89 == $event.keyCode) {
              $scope.redo();
            } else if ($event.altKey && 187 == $event.keyCode) {
              $scope.stepIcon(true);
            } else if ($event.altKey && 189 == $event.keyCode) {
              $scope.stepIcon(false);
            } else {
              $event.returnValue = true;
            }
          });
        };

        document.addEventListener("keydown", $scope.onKeyDown);

        $scope.focusedNodeScope = null;
        $scope.onFocus = function(nodeScope, $event) {
          $scope.focusedNodeScope = nodeScope;
        }

        $scope.exportFuns.undo = $scope.undo;
        $scope.exportFuns.redo = $scope.redo;
      }
    ]);
})();
