(function() {
  'use strict';

  angular.module('ui.tree')
    .directive('uiTreeNode', ['treeConfig', '$uiTreeHelper', '$window', '$document', '$timeout', '$filter',
      function (treeConfig, $uiTreeHelper, $window, $document, $timeout, $filter) {
        return {
          require: ['^uiTreeNodes', '^uiTree'],
          restrict: 'EA',
          controller: 'TreeNodeController',
          link: function(scope, element, attrs, controllersArr) {
            var config = {};
            angular.extend(config, treeConfig);
            if (config.nodeClass) {
              element.addClass(config.nodeClass);
            }
            scope.init(controllersArr);

            scope.collapsed = !!$uiTreeHelper.getNodeAttribute(scope, 'collapsed');
            scope.$watch(attrs.collapsed, function(val) {
              if ((typeof val) === "boolean") {
                scope.collapsed = val;
              }
            });
            scope.$watch('collapsed', function(val) {
              $uiTreeHelper.setNodeAttribute(scope, 'collapsed', val);
              attrs.$set('collapsed', val);
            });

            var hasTouch = 'ontouchstart' in window;



          }
        };
      }
    ]);
})();
