// import angular from 'angular';
import view from './view.html';
import styles from './style.css';
import {
	SCENE_HEADING,
	ACTION,
	CHARACTER_NAME,
	DIALOGUE,
	PARENTHETICAL,
  IGNORE
}
from '../constants';
let name = 'tagging';
let parentState = 'prep';
let state = parentState + '.' + name;
let ctrlname = name + 'Controller';
// module
let module = angular.module(name, [])
	.config(function ($stateProvider) {
		$stateProvider.state(state, {
			url: '/' + name,
			template: view,
			controller: ctrlname
		});
	})
	.controller(ctrlname, function ($scope, $log, $timeout) {
    let PAGESIZE = 300;
		$scope.name = ctrlname;
		$scope.segments = [];
		$scope.script = null;
		$scope.styles = styles;
		$scope.tags = [SCENE_HEADING, ACTION, CHARACTER_NAME, DIALOGUE, PARENTHETICAL, IGNORE];
		$log.debug('controler: ' + ctrlname);

		if ($scope.$parent.selected) {
			movieChanged(null, $scope.$parent.selected);
		}
		$scope.$on('movieChanged', movieChanged);
		$scope.getClass = function (tag) {
			// console.log(tag)
			switch (tag) {
			case SCENE_HEADING:
				return styles.sceneHeading;
			case ACTION:
				return styles.action;
			case CHARACTER_NAME:
				return styles.characterName;
			case DIALOGUE:
				return styles.dialogue;
			case PARENTHETICAL:
			return styles.parenthetical;
      case IGNORE:
				return styles.ignore;
			default:
				return '';
			}
		};

		function movieChanged(event, data) {
      $scope.showLoader = true;
      $timeout(function() {
        $scope.$apply();
      });
			fetch('/script?id=' + data.id)
				.then(res=>res.json())
        .then(script=>{
					$log.debug('script:');
					$log.debug(script);
          $scope.segments = [];
					$scope.script = script;
					$scope.loadMore();
          $scope.showLoader = false;
					$scope.$apply();
				})
				.catch(function (err) {
					$log.debug(err);
				});
		}

		$scope.loadMore = function () {
			let start = $scope.segments.length;
      if (!$scope.script || start>$scope.script.segments.length){
        return;
      }
      let newSegments = $scope.script.segments.slice(start, start + PAGESIZE);
			$scope.segments = $scope.segments.concat(newSegments);
			$log.debug('loading...' + $scope.segments.length + ' itmes');
      // $scope.showLoader = true;
		};
		$scope.updateContent = function(segID, newSegContent){
			$log.debug('updateContent');
			$log.debug(segID+':' + newSegContent);
			const data = new FormData();
			data.append('id', $scope.script.id);
			data.append('segID', segID);
			data.append('content', newSegContent);
			fetch('/update_segment', {
					method: 'POST',
					body: data
				})
				.then(response => response.json())
				.then(json => {
					if (json.matched_count === 0) {
						//  TODO: better handling of failure
						$log.log('Error in updateContent: json.matched_count==0');
					}
				});

		};
		$scope.updateTag = function (segID, newSegTag) {
      $log.debug('updateTag');
			const data = new FormData();
			data.append('id', $scope.script.id);
			data.append('segID', segID);
			data.append('tag', newSegTag);
			fetch('/update_segment', {
					method: 'POST',
					body: data
				})
				.then(response => response.json())
				.then(json => {
					if (json.matched_count === 0) {
						//  TODO: better handling of failure
						$log.log('Error in updateTag: json.matched_count==0');
					}
				});
		};
	});
export {
	ctrlname,
	view
};
export default module.name;
