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

          // $scope.$watch(function() {
          //     return $scope.node
          //   }, 
          //   function(newVal, oldVal) {
          //   console.log("watch");
          //   console.log(newVal);
          //   console.log(oldVal);
          // });

          // $scope.$watch(function() {
          //     return $scope.node_stub
          //   }, 
          //   function(newVal, oldVal) {
          //   console.log("watch node_stub");
          //   console.log(JSON.stringify(newVal, null, 2));
          //   console.log(JSON.stringify(oldVal, null, 2));
          // });



          

          // $scope.node.nodes = [];
          // var temp_list = [];
          // var node_count = 0;
          // for (var i = 0; !!$scope.node.children && i < $scope.node.children.length; i++) {
          //   console.log($scope.base_url + "/nodes/" + $scope.node.children[i])
          //   var ref = new Firebase($scope.base_url + "/nodes/" + $scope.node.children[i]);
          //   var node = $firebase(ref).$asObject();
          //   node.$ref = ref;
          //   temp_list.push(node);
          //   node.$loaded().then(function() {
          //     node_count = node_count + 1;
          //     if (node_count == $scope.node.children.length) {
          //       for (var i = 0; i < temp_list.length; i++) {
          //         temp_list[i].collapsed = false;
          //         temp_list[i].selected = false;
          //         $scope.node.nodes.push({
          //           content : temp_list[i].content,
          //           collapsed : temp_list[i].collapsed,
          //           selected : false,
          //           children : temp_list[i].children,
          //           $remoteNode : temp_list[i]
          //         });
          //       };
          //     };
          //   })
          // };

          //console.log($firebase($scope.node.$ref.child("content")).$asObject().$bindTo($scope.node, "content"));


          // //var path= "/content";
          // var path= "";
          // var currentScope = $scope;
          // while(currentScope) {
          //   var index = currentScope.$parentNodesScope.$modelValue.indexOf(currentScope.node);
          //   //console.log(index);
          //   path = index + path;
          //   currentScope = currentScope.$parentNodeScope;
          //   if (!currentScope) break;
          //   path = "/nodes/" + path;
          // }
          // // console.log(path)
          // // console.log($scope.ref)

          // var remoteNode = $firebase($scope.ref.child(path)).$asObject();
          //console.log($scope.node.$remoteNode)
          //$scope.node.$remoteNode.$bindTo($scope, "$remoteNode");
          // //setTimeout(function() {console.log($scope.remoteNode)}, 10000);

          // $scope.$watch(function() {
          //     return $scope.node.content
          //   }, 
          //   function(newVal, oldVal) {
          //   if (newVal != oldVal) {
          //     $scope.node.$remoteNode.content = newVal;
          //     $scope.node.$remoteNode.$save();
          //   }
          // });

          // console.log($scope.node.$remoteNode)
          // $scope.node.$remoteNode.$watch(function(){
          //   //console.log(remoteNode.content)
          //   if ($scope.node.content != $scope.node.$remoteNode.content) {
          //     $scope.node.content = $scope.node.$remoteNode.content;
          //   }
          //   if ($scope.node.collapsed != $scope.node.$remoteNode.collapsed) {
          //     $scope.node.collapsed = $scope.node.$remoteNode.collapsed
          //   }
          // })

          // if ($scope.node.nodes) {
          //   $scope.node.nodes.push({content:"testtest"});
          // }

          // $scope.$watch(function() {
          //     return $scope.remoteNode.content;
          //   }, 
          //   function(newVal, oldVal) {
          //   if (newVal != oldVal) {
          //     $scope.node.content = newVal;
          //   }
          // });

          // $scope.$watch(function() {
          //     return $scope.node.collapsed
          //   }, 
          //   function(newVal, oldVal) {
          //   if (newVal != oldVal) {
          //     $scope.node.$remoteNode.collapsed = newVal;
          //     $scope.node.$remoteNode.$save();
          //   }
          // });

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
            $scope.$treeScope.$selecteds.push($scope);
          }
        };

        $scope.unselect = function() {
          // console.log("unselect")
          // console.log($scope.$parentNodeScope.selected)
          // console.log($scope.selected)
          if (!$scope.$parentNodeScope.selected && $scope.selected) {
            $scope.unselectNode();
            var indexOf = $scope.$treeScope.$selecteds.indexOf($scope);
            if (angular.isDefined(indexOf) && indexOf > -1) {
              $scope.$treeScope.$selecteds.splice(indexOf, 1);
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
          if (!$scope.$parentNodeScope.selected && $scope.selected) {
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

        $scope.createContentNode = function(selectedNodeScope) {
          var node = {};
          node.key = selectedNodeScope.node_stub.key
          node.content = selectedNodeScope.node.content;
          node.selected = true;
          node.collapsed = selectedNodeScope.node.collapsed;
          node.nodes = [];
          for (var i = 0; i < selectedNodeScope.childNodes().length; i++) {
            node.nodes.push($scope.createContentNode(selected_node.nodes[i]));
          };
          return node;
        }

        $scope.copy = function () {
          // console.log($scope.$treeNodesCtrl.scope.$modelValue[0] === $scope.$treeScope.$selecteds[0]);
          var selectedNodes = [];
          for (var i = 0; i < $scope.$treeScope.$selecteds.length; i++) {
            selectedNodes.push($scope.createContentNode($scope.$treeScope.$selecteds[i]))
          };
          delete localStorage.clipboardData;
          localStorage.clipboardData = undefined;
          localStorage.clipboardData = JSON.stringify(selectedNodes);
          //console.log(JSON.stringify(localStorage.clipboardData));
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

        $scope.syncNodesToRemote = function(nodesScope) {
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
              key : old_tree.key,
              children : []
            };
            for (var i = 0; !!old_tree.children && i < old_tree.children.length; i++) {
              new_tree.children.push(clone_tree(old_tree.children[i]))
            }
            return new_tree;
          };
          var new_tree = clone_tree(nodesScope.$nodeScope.node_stub)
          //console.log(new_tree)
          sync.$set(new_tree);
        }

        $scope.addNewItem = function(nodesScope, position) {
          var new_key = $uiTreeHelper.getUniqueId();
          var node_stub = {
            key : new_key,
            children : []
          }
          //console.log("scope.$modelValue : " + JSON.stringify(scope.$modelValue, null, 2))
          //console.log(scope.$modelValue)
          nodesScope.$modelValue.splice(position, 0, node_stub);
          //console.log(scope.$modelValue)
          setTimeout(function(){
            $scope.focusNode(nodesScope, node_stub.$$hashKey);
          }, 0);
          var sync = $firebase(new Firebase($scope.base_url + "/nodes"));
          sync.$set(new_key, {
            content : "",
            collapsed : false,
          }).then(function(ref) {
            //console.log("ref key(): " + ref.key());   // key for the new ly created record
          }, function(error) {
            console.log("Error:", error);
          });

          $scope.syncNodesToRemote(nodesScope);
        }

        $scope.newSubItem = function(scope) {
          //console.log(JSON.stringify($scope.tree))
          // if (!$scope.$childNodesScope.$modelValue) {
          //   $scope.$childNodesScope.$modelValue = [];
          //   $scope.$parentNodesScope.initSubNode($scope); // init sub nodes
          // }
          //console.log("newSubItem: " + JSON.stringify($scope.$childNodesScope.$modelValue, null, 2))
          setTimeout(function(){
            $scope.addNewItem($scope.$childNodesScope, 0);
          }, 0);
        };

        $scope.focusNode = function(nodesScope, hashKey) {
          var nodeScope = nodesScope.getSubNode(hashKey);
          if (nodeScope)
            nodeScope.$element[0].childNodes[1].childNodes[3].childNodes[3].focus();
        }

        $scope.newSiblingNode = function(next) {
          var index = $scope.index();
          var position = -1;
          if (next) {
            position = index+1;
          } else {
            position = index;
          }
          //console.log($scope.$parentNodesScope);
          $scope.addNewItem($scope.$parentNodesScope, position);
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
              $scope.newSiblingNode(direction);
              // var node = $scope.newSiblingNode(direction);
              // setTimeout(function(){
              //   $scope.focusNode($scope.$parentNodesScope, node.$$hashKey);
              // }, 0);

              $event.cancelBubble = true;
            }
          } else if ($event.ctrlKey && 67 == $event.keyCode) {
            if (0 < $scope.$treeScope.$selecteds.length) {
              //console.log($scope.$treeScope.$selecteds);
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
          var removedNode = $scope.$parentNodesScope.removeNode($scope.$modelValue);
          $scope.syncNodesToRemote($scope.$parentNodesScope);
          return removedNode;
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
