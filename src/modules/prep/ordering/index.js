// import angular from 'angular';
import view from './view.html';
import styles from './style.css';
import OrderVis from './orderVis.js';

import {
	SCENE_HEADING,
	ACTION,
	CHARACTER_NAME,
	DIALOGUE,
	PARENTHETICAL,
  IGNORE
}
from '../constants';
let name = 'ordering';
let parentState = 'prep';
let state = parentState + '.' + name;
let ctrlname = name + 'Controller';
let module = angular.module(name, [])
	.config(function ($stateProvider) {
		$stateProvider.state(state, {
			url: '/' + name,
			template: view,
			controller: ctrlname
		});
	})
	.filter('numberFixedLen', function () {
		return function (n, len) {
			var num = parseInt(n, 10);
			len = parseInt(len, 10);
			if (isNaN(num) || isNaN(len)) {
				return n;
			}
			num = '' + num;
			while (num.length < len) {
				num = '0' + num;
			}
			return num;
		};
	})
	.directive('onFinishRender', function ($timeout) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						scope.$emit(attr.onFinishRender);
					});
				}
			}
		};
	})
	.controller(ctrlname, function ($scope, $log, $timeout) {
		$scope.name = ctrlname;
		$scope.numLen = 3;
		$scope.script = null;
		$scope.scenes = [];
		$scope.orderVis = new OrderVis();
		let visContainer = d3.select('#orderVis');

		$scope.sortableOptions = {
			update: (e, ui) => {
				var oldIndex = ui.item.sortable.index;
				var newIndex = ui.item.index();
				$log.debug('from : ' + oldIndex + ' to: ' + newIndex);

			}
		};

		if ($scope.$parent.selected) {
			movieChanged(null, $scope.$parent.selected);
		}
		$scope.$on('movieChanged', movieChanged);
		$scope.$on('ngRepeatFinished', function () {
			$('.scene.accordion').accordion();
			Sortable.create(document.getElementById('orderedList'), {
				ghostClass: styles.sortableGhost,
				onEnd: function (e) {
					$log.debug('from : ' + e.oldIndex + ' to: ' + e.newIndex);
					// update story orders
					const scene = $scope.scenes[e.oldIndex].heading;
					const newOrders = [];
					newOrders.push({
						id: $scope.script.id,
						segID: scene.segID,
						storyOrder: e.newIndex,
            prevStoryOrder: scene.storyOrder
					});
					const delta = e.newIndex > e.oldIndex ? -1 : 1;
					let i = e.newIndex;
					while (i != e.oldIndex) {
						const scene = $scope.scenes[i].heading;
						i += delta;
						newOrders.push({
							id: $scope.script.id,
							segID: scene.segID,
							storyOrder: i,
              prevStoryOrder: scene.storyOrder
						});
					}
          $log.debug('newOrders:');
          $log.debug(newOrders);
					// update server
					Promise.all(newOrders.map(d => {
            const data = new FormData();
            data.append('id', d.id);
            data.append('segID', d.segID);
            data.append('storyOrder', d.storyOrder);
            return fetch('/update_segment', {
              method: 'POST',
              body: data
            });
					})).then(responses => {
						const filtered = responses.filter(res => res.json().matched_count === 0);
						if (filtered.length > 0) {
							$log.error('Error in updateStoryOrders: json.matched_count==0');
						} else {
							newOrders.map(d=>{
                $log.debug('prev: ' + d.prevStoryOrder + 'next: ' + d.storyOrder);
                $scope.scenes[d.prevStoryOrder].heading.storyOrder = d.storyOrder;
              });
							$scope.scenes.sort((a, b) => a.heading.storyOrder - b.heading.storyOrder);
              updateVis($scope.scenes);
						}
					});


				}
			});
		});
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
			$timeout(function () {
				$scope.$apply();
			});
			fetch('/script?id=' + data.id)
				.then(res => res.json())
				.then(script => {
					$scope.script = script;
					// group by scenes
					$scope.scenes = groupByScene(script.segments);
					$scope.numLen = $scope.scenes.length.toString().length;
					updateVis($scope.scenes);

					$scope.showLoader = false;
					$scope.$apply();
				})
				.catch(function (err) {
					$log.debug(err);
				});
		}


		function groupByScene(segments) {
			$log.debug('parsing segments into scenes');

			// sort segments by their original order
			segments.sort((a, b) => a.segID - b.segID);
			// filter non-scene information (transition or parenthetical)

			// extract scene headings
			const oldHeadings = segments.filter(x => x.storyOrder && x.tag === SCENE_HEADING);
			const newHeadings = segments.filter(x => !x.storyOrder && x.tag === SCENE_HEADING);
			const allHeadings = segments.filter(x => x.tag === SCENE_HEADING);
			$log.debug('oldHeadings:');
			$log.debug(oldHeadings);
			$log.debug('newHeadings:');
			$log.debug(newHeadings);

			// assign show order (or narrative)
			allHeadings.forEach((x, i) => {
				x.showOrder = i;
			});

			// assign story order for the first time
			if (oldHeadings.length === 0 && newHeadings.length !== 0) {
				newHeadings.forEach((x, i) => {
					x.storyOrder = i;
				}); // same as presentation order

				// story order was previously assigned to some heading (mixed)
			} else if (oldHeadings.length !== 0 && newHeadings.length !== 0) {
				const existingOrders = oldHeadings.map(x => x.storyOrder);
				let storyOrder = 0;
				for (const heading of newHeadings) {
					while (existingOrders.includes(storyOrder)) {
						storyOrder += 1;
					}
					heading.storyOrder = storyOrder;
					storyOrder += 1;
				}

			}
			// no changes in order
			// else if (oldHeadings.length !== 0 && newHeadings.length === 0) {
			// // impossible condition
			// } else if (oldHeadings.length === 0 && newHeadings.length === 0) {
			// }

			// cluster into scenes
			const scenes = [];
			let scene = null;
			for (const segment of segments) {
				if (segment.tag === SCENE_HEADING) {
					scene = {
						heading: segment,
						segments: []
					};
					scenes.push(scene);
				} else if (scene) {
					scene.segments.push(segment);
				} else {
					// scenes.push(segment);
					$log.error('invalid scene found!');
				}
			}
			$log.debug('script constructed:');

			scenes.sort((a, b) => a.heading.storyOrder - b.heading.storyOrder);

			return scenes;
		}

		function updateVis(scenes) {
			// derive data
			let data = [];
			for (let scene of scenes) {
				data.push({
					showOrder: scene.heading.showOrder,
					storyOrder: scene.heading.storyOrder,
					dialogueSize: scene.segments.reduce((sum, seg) =>
						sum + (seg.tag === DIALOGUE ? seg.content.length : 0), 0),
					charSize: new Set(scene.segments
						.filter(seg => seg.tag === CHARACTER_NAME)
						.map(seg => seg.content)).size
				});
			}

			$log.debug('data:');
			$log.debug(data);
			$scope.orderVis.update(visContainer, data);
		}
	});
export default module.name;
