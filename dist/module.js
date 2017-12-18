webpackJsonp([0,2],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _stringify = __webpack_require__(2);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _view = __webpack_require__(5);

	var _view2 = _interopRequireDefault(_view);

	var _style = __webpack_require__(6);

	var _style2 = _interopRequireDefault(_style);

	var _ordervis = __webpack_require__(10);

	var _ordervis2 = _interopRequireDefault(_ordervis);

	var _metavis = __webpack_require__(92);

	var _metavis2 = _interopRequireDefault(_metavis);

	var _helper = __webpack_require__(95);

	var _helper2 = _interopRequireDefault(_helper);

	var _prep = __webpack_require__(100);

	var _prep2 = _interopRequireDefault(_prep);

	var _constants = __webpack_require__(99);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	angular.module('app', ['ui.router', 'infinite-scroll', _prep2.default, vis]).config(function ($stateProvider) {
		//$locationProvider,
		$stateProvider.state(name, {
			url: '/' + name,
			template: _view2.default,
			controller: ctrlname
		});
	}).directive('onFinishRender', function ($timeout) {
		return {
			restrict: 'A',
			link: function link(scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						scope.$emit(attr.onFinishRender);
					});
				}
			}
		};
	}).controller('appCtrl', function ($scope, $log, $window, $timeout) {
		// $state.go('vis');
		$scope.name = ctrlname;
		$log.debug('controler:' + ctrlname);
		$scope.showLoader = true;
		$scope.scriptLoader = false;
		$scope.css = _style2.default;
		$scope.scriptinfo = null;
		$scope.movieinfo = null;
		$scope.titles = [{
			title: 'Pulp Fiction',
			data_url: '/assets/datasets/pulp_fiction.json'
		}, {
			title: 'Memento',
			data_url: '/assets/datasets/memento.json'
		}, {
			title: 'Eternal Sunshine of the Spotless Mind',
			data_url: '/assets/datasets/eternal_sunshine_of_the_spotless_mind.json'
		}, {
			title: 'Usual Suspects',
			data_url: '/assets/datasets/usual_suspects.json'
		}, {
			title: '500 Days of Summer',
			data_url: '/assets/datasets/500_days_of_summer.json'
		}, {
			title: 'Fight Club',
			data_url: '/assets/datasets/fight_club.json'
		}, {
			title: 'Reservoir Dogs',
			data_url: '/assets/datasets/reservoir_dogs.json'
		}, {
			title: '12 Monkeys',
			data_url: '/assets/datasets/12_monkeys.json'
		}, {
			title: 'Prestige',
			data_url: '/assets/datasets/prestige.json'
		}, {
			title: 'Annie Hall',
			data_url: '/assets/datasets/annie_hall.json'
		}];
		$scope.ordering = _constants.NARRATIVE;
		$scope.showSceneLength = true;
		$scope.showRichView = true;
		$scope.charColor = _constants.COLOR_CHARACTERS;
		$scope.toggleCharacters = false;
		$scope.toggleLocations = false;
		$scope.toggleTimes = true;
		// $scope.mode = SHOW_ALL;

		$scope.options = {
			numChars: 8,
			numLocs: 4,
			numTimes: 2,
			locations: [],
			characters: [],
			times: []
		};

		// let fixedSize = true;
		var ordervis = new _ordervis2.default('#ordervis');
		var charvisGroup = null;
		var locvisGroup = null;
		// let intextvisGroup = null;
		var timevisGroup = null;
		var allVisGroup = null;

		var scenedata = null;
		var scenedata_backup = null;
		var chardata = null;
		var locdata = null;
		// let intextdata = null;
		var timedata = null;

		var duration = 400;
		var selected = [];

		var genderMap = {};
		var prevWidth = angular.element('#visContainer').width();

		// color themes
		var default_palette = ['#00B5AD'];
		var sentiment = ['Negative', 'Neutral', 'Positive'];
		var sentiment_palette = ['#D32F2F', '#9E9E9E', '#4CAF50'];
		var gender = ['Unknown', 'Male', 'Female'];
		var gender_palette = ['#9E9E9E', '#3F51B5', '#E91E63'];

		var loc_order_palette = ['#eedaf1', '#fad1df', '#cfe8fc', '#daddf1'];
		var loc_meta_palette = ['#CE93D8', '#F48FB1', '#90CAF9', '#9FA8DA']; //['url(#lightstripe) #CE93D8', 'url(#crosshatch) #F48FB1', 'url(#houndstooth) #BCAAA4', 'url(#verticalstripe) #9FA8DA'];//['#CE93D8','#F48FB1','#BCAAA4','#9FA8DA'];['#CE93D8','#F48FB1','#BCAAA4','#9FA8DA'];//['url(#lightstripe) #CE93D8', 'url(#crosshatch) #F48FB1', 'url(#houndstooth) #BCAAA4', 'url(#verticalstripe) #9FA8DA'];//['#CE93D8','#F48FB1','#BCAAA4','#9FA8DA'];
		var time_palette = ['#CFD8DC', '#B0BEC5', '#90A4AE']; //['url(#lightstripe)', 'url(#verticalstripe)', 'url(#houndstooth)'];

		var character_palette = ['#db2828', '#f2711c', '#fbbd08', '#b5cc18', '#21ba45', '#00b5ad', '#2185d0', '#6435c9'];

		preprocessing();

		var getSentiment = function getSentiment(d, filter) {
			var filtered = d.character_metadata.filter(function (d) {
				return d.name == filter;
			});
			if (filtered.length != 1) {
				return null;
			}
			var sentiment = filtered[0].sentiment;
			return sentiment == 0 ? 'Neutral' : sentiment > 0 ? 'Positive' : 'Negative';
		};
		var getGender = function getGender(d, filter) {
			var filtered = d.character_metadata.filter(function (d) {
				return d.name == filter;
			});
			if (filtered.length != 1) {
				return null;
			}
			return genderMap[filter];
		};
		var getCharName = function getCharName(d, filter) {
			var filtered = d.character_metadata.filter(function (d) {
				return d.name == filter;
			});
			if (filtered.length != 1) {
				return null;
			}
			return filter;
		};
		var getLocName = function getLocName(d, filter) {
			return d.scene_metadata.location == filter ? filter : null;
		};
		var getTimeName = function getTimeName(d, filter) {
			return d.scene_metadata.time == filter ? filter : null;
		};
		var highlightCooccur = function highlightCooccur(target, d, highlights) {
			return target.data == null ? false : highlights.length == 0 ? true : highlights.every(function (h) {
				return h.type == 'characters' ? d[h.type].includes(h.filter) : d.scene_metadata[h.type] == h.filter;
			});
		};

		var highlightAll = function highlightAll(target, d, highlights) {
			return target.data == null ? false : highlights.length == 0 ? true : highlights.some(function (h) {
				return target.data == h.filter;
			});
		};
		// initialize semantic ui components ------------------------------
		$('.accordion').accordion({ exclusive: false });

		$('.ui.embed').embed();
		$('.button').popup();
		$('.dropdown').popup();

		$('#select-scene-color').dropdown({
			onChange: function onChange(value) {
				return $scope.charColorSelected(value);
			}
		});

		// load titles TODO: include thumbnail data
		$('#select-movie').dropdown({
			onChange: movieSelected
		});

		// read movie titles
		// fetch('/titles')
		// 	.then(response => {
		// 		response.json().then(data => {
		// 			$scope.showLoader = false;
		// 			$scope.titles = data.titles;
		// 			$scope.$apply(); // update the dropdown
		// 			// select default movie
		// 			if ($scope.titles.length > 0) {
		// 				$log.debug('default: ' + $scope.titles[0].title);
		// 				$('#select-movie').dropdown('refresh');
		// 				$('#select-movie').dropdown('set selected', $scope.titles[0]._id);
		// 			}
		// 		});
		// 	}).catch(err => $log.debug(err));
		// if ($scope.titles.length > 0) {
		// 	$log.debug('default: ' + $scope.titles[0].data_url);
		//
		// 	$('#select-movie').dropdown('refresh');
		//
		//
		// }
		fetch($scope.titles[0].data_url).then(function (res) {
			return res.json();
		}).then(function (data) {
			$('#select-movie').dropdown('refresh');
			$('#select-movie').dropdown('set selected', $scope.titles[0].data_url);
			$log.debug('data:');
			$log.debug(data);
			initialize(data);
		}).catch(function (err) {
			return $log.debug(err);
		});

		// callback functions
		$scope.$on('onScriptRendered', function () {
			// $('.script.accordion').accordion();
			Sortable.create(document.getElementById('script-view'), {
				ghostClass: _style2.default.sortableGhost,
				// dragClass: css.dragClass,
				// chosenClass: css.chosenClass,
				draggable: '.' + _style2.default.sceneView,
				handle: '.' + _style2.default.sceneHandle,
				animation: 150,
				scrollSpeed: 50,
				onEnd: updateStoryOrder
			});
		});

		// private functions =======================================================
		function movieSelected(data_url, title) {
			$log.debug('Movie Selected: ' + title);
			// $('#select-movie').dropdown('set selected', data_url);
			$scope.showLoader = true;
			$scope.$apply();

			// $timeout(()=>);//show loader
			fetch(data_url).then(function (res) {
				return res.json();
			}).then(function (data) {
				$log.debug('data:');
				$log.debug(data);
				initialize(data);
			}).catch(function (err) {
				return $log.debug(err);
			});
		}

		function initialize(data) {
			//called only when changing the movie

			$scope.scriptinfo = data.script_info;
			$scope.movieinfo = data.movie_info;

			// fix genre & release date attributes
			$scope.movieinfo.genre = $scope.movieinfo.genres.join(', ');
			$scope.movieinfo.keyword = $scope.movieinfo.keywords.map(function (d) {
				return d.charAt(0).toUpperCase() + d.slice(1);
			}).join(', ');
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			var date = new Date($scope.movieinfo.release_date);
			$scope.movieinfo.release_date = months[date.getMonth()] + ' ' + date.getFullYear();

			_helper2.default.resolveCharacterInfo($scope.movieinfo.cast, $scope.scriptinfo.characters, date);
			// infer gender & construct gender map
			_helper2.default.inferGender($scope.movieinfo.cast, data.script_info.characters);

			data.script_info.characters.forEach(function (c) {
				return genderMap[c.name] = c.gender;
			});

			// update visualizatoin
			selected = [];
			initializeData();
			toggleRichView();
			switchCharVis();
			updateVis();
			$scope.$apply(); // update script
		}
		function initializeData() {
			// scenes
			scenedata = $scope.scriptinfo.scenes;
			scenedata_backup = JSON.parse((0, _stringify2.default)(scenedata));
			// characters
			chardata = _helper2.default.getCharData($scope.scriptinfo, $scope.options);
			// locations
			locdata = _helper2.default.getSceneMetadata($scope.scriptinfo, 'location', $scope.options.numLocs);
			// interior/exterior
			// intextdata = Helper.getIntExtData($scope.scriptinfo, $scope.options);
			// times of day
			timedata = _helper2.default.getSceneMetadata($scope.scriptinfo, 'time', $scope.options.numTimes);
			// sript
			$scope.script = _helper2.default.getScriptData($scope.scriptinfo, $scope.ordering);
			// complexity
			$scope.complexity = _helper2.default.calcTemporalNonlinearity($scope.scriptinfo.scenes);

			if ($scope.toggleCharacters) {
				chardata.forEach(function (d) {
					return selected.indexOf(d) == -1 && selected.push(d);
				});
			} else {
				chardata.forEach(function (d) {
					return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
				});
			}
			if ($scope.toggleLocations) {
				locdata.forEach(function (d) {
					return selected.indexOf(d) == -1 && selected.push(d);
				});
			} else {
				locdata.forEach(function (d) {
					return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
				});
			}
			if ($scope.toggleTimes) {
				timedata.forEach(function (d) {
					return selected.indexOf(d) == -1 && selected.push(d);
				});
			} else {
				timedata.forEach(function (d) {
					return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
				});
			}
			ordervis.highlights(selected);
		}

		function preprocessing() {
			$('#select-scene-color').dropdown('set selected', $scope.charColor);

			charvisGroup = _.range($scope.options.numChars).map(function () {
				return new _metavis2.default();
			});
			locvisGroup = _.range($scope.options.numLocs).map(function () {
				return new _metavis2.default();
			});
			// intextvisGroup = _.range($scope.options.numIntExts).map(()=> new MetaVis());
			timevisGroup = _.range($scope.options.numTimes).map(function () {
				return new _metavis2.default();
			});
			allVisGroup = charvisGroup.concat(locvisGroup)
			// .concat(intextvisGroup)
			.concat(timevisGroup).concat([ordervis]);
			allVisGroup.forEach(function (vis) {
				vis.width(prevWidth).size($scope.showSceneLength ? function (d) {
					return d.scene_metadata.size;
				} : function () {
					return 1;
				}).on('zoom', onZoom).on('mouseover', onMouseOver).on('mouseout', onMouseOut).on('click', onMouseClick);
				if (vis.constructor.name == 'MetaVis') {
					vis.on('click_on_label', onMouseClickLabel);
				}
			});
			locvisGroup.forEach(function (vis) {
				vis.category(function (d, filter) {
					return d.scene_metadata.location == filter ? '' : null;
				});
			});
			locvisGroup.forEach(function (vis) {
				vis.category(function (d, filter) {
					return d.scene_metadata.time == filter ? '' : null;
				});
			});
		}

		function updateVis() {
			$scope.showLoader = true;
			$timeout(function () {
				updateOrderVis();
				$timeout(function () {
					updateCharVis();
					$timeout(function () {
						updateLocVis();
						$timeout(function () {
							// updateIntExtVis();
							// $timeout(()=>{
							updateTimeVis();
							$scope.showLoader = false;
							// }, duration);
						}, duration);
					}, duration);
				}, duration);
			}, duration);
		}
		function updateOrderVis() {
			ordervis.draw(scenedata);
		}
		function updateCharVis() {
			// character
			var selection = d3.select('#charactervis').selectAll('.character').data(chardata);

			selection = selection.enter().append('div').attr('class', 'character').merge(selection);

			selection.each(function (d, i) {
				charvisGroup[i].container(this).draw(d);
			});
		}

		function updateLocVis() {
			//location
			var selection = d3.select('#locvis').selectAll('.loc').data(locdata);

			selection = selection.enter().append('div').attr('class', 'loc').merge(selection);
			selection.each(function (d, i) {
				locvisGroup[i].container(this).draw(d);
			});
		}
		function updateTimeVis() {
			//location
			var selection = d3.select('#timevis').selectAll('.time').data(timedata);

			selection = selection.enter().append('div').attr('class', 'time').merge(selection);
			selection.each(function (d, i) {
				timevisGroup[i].container(this).draw(d);
			});
		}
		function updateStoryOrder(e) {
			if (e.oldIndex == e.newIndex) {
				return;
			}
			$log.debug('from : ' + e.oldIndex + ' to: ' + e.newIndex);
			//update story orders
			// e.oldIndex-=1;//because of loader
			// e.newIndex-=1;


			var scenes = scenedata;
			scenes.sort(function (a, b) {
				return a.story_order - b.story_order;
			});
			var scene = scenes[e.oldIndex];
			// $log.debug(scene);
			var newOrders = [];
			newOrders.push({
				story_order: e.newIndex,
				prev_story_order: scene.story_order
			});
			var delta = e.newIndex > e.oldIndex ? -1 : 1;
			var i = e.newIndex;
			while (i != e.oldIndex) {
				var _scene = scenes[i];
				i += delta;
				newOrders.push({
					story_order: i,
					prev_story_order: _scene.story_order
				});
			}
			// $log.debug('newOrders:');
			// $log.debugr(newOrders);
			scenedata_backup.sort(function (a, b) {
				return a.story_order - b.story_order;
			});
			newOrders.map(function (d) {
				// $log.debug('prev: ' + d.prev_story_order + 'next: ' + d.story_order);
				scenes[d.prev_story_order].story_order = d.story_order;
				scenedata_backup[d.prev_story_order].story_order = d.story_order;
			});

			updateVis();
			// Sync
			// scenes.sort((a,b)=>a.story_order-b.story_order);

			// update vis & script
			// console.log('update story order');
			// console.log(scenedata_backup);
			// update script

			$scope.showLoader = true;

			$timeout(function () {
				$scope.script = _helper2.default.getScriptData($scope.scriptinfo, $scope.ordering);
				updateVis();
			});

			// const data = new FormData();
			// data.append('id', $scope.scriptinfo._id.$oid);
			// data.append('scenes',  JSON.stringify(scenedata_backup));
			// return fetch('/update_story_order', {
			// 	method: 'POST',
			// 	body: data
			// });

		}

		function onZoom(transform) {
			allVisGroup.forEach(function (vis) {
				return vis.transform('transform', transform);
			});
		}
		function onMouseOver(d) {
			var order = d.xo != undefined ? d.xo : d.order;
			allVisGroup.forEach(function (vis) {
				return vis.highlightOn(order);
			});
			$scope.highlightSceneInScript(order, true);
		}
		function onMouseOut(d) {
			var order = d.xo != undefined ? d.xo : d.order;
			allVisGroup.forEach(function (vis) {
				return vis.highlightOff(order);
			});
			$scope.highlightSceneInScript(order, false);
			// ordervis.highlights(null);
		}
		function onMouseClick(d) {
			var order = d.xo != undefined ? d.xo : d.order;
			var child = $('#scene-' + order);
			var parent = $('#script-view');
			// console.log('order:',order);

			parent.animate({
				scrollTop: parent.scrollTop() - parent.offset().top + child.offset().top
			}, 500);

			child.click();
		}
		function onMouseClickLabel(d) {
			$timeout(function () {
				if ($scope.toggleCharacters && d.type == 'characters') {
					$scope.toggleCharacters = false;
					chardata.forEach(function (d) {
						return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
					});
				} else if ($scope.toggleLocations && d.type == 'location') {
					$scope.toggleLocations = false;
					locdata.forEach(function (d) {
						return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
					});
				} else if ($scope.toggleTimes && d.type == 'time') {
					$scope.toggleTimes = false;
					timedata.forEach(function (d) {
						return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
					});
				}

				var idx = selected.indexOf(d);
				if (idx > -1) {
					selected.splice(idx, 1);
				} else {
					selected.push(d);
				}
				// update ordervis
				ordervis.highlights(selected);
			});
		}
		function toggleRichView() {
			if ($scope.showRichView) {
				ordervis.children(function (d) {
					return d.characters;
				});
				if ($scope.charColor == _constants.COLOR_GENDER) {
					ordervis.childCategory(function (c, p) {
						return getGender(p, c);
					});
					ordervis.categoryScale().domain(gender).range(gender_palette);
				} else if ($scope.charColor == _constants.COLOR_SENTIMENT) {
					ordervis.childCategory(function (c, p) {
						return getSentiment(p, c);
					});
					ordervis.categoryScale().domain(sentiment).range(sentiment_palette);
				} else if ($scope.charColor == _constants.COLOR_CHARACTERS) {
					var charNames = chardata.map(function (d) {
						return d.filter;
					});
					ordervis.childCategory(function (c) {
						return c;
					});
					ordervis.categoryScale().domain(charNames).range(character_palette);
				}

				var locNames = locdata.map(function (d) {
					return d.filter;
				});
				var locColorScale = d3.scaleOrdinal().domain(locNames).range(loc_meta_palette);
				locdata.forEach(function (d, i) {
					locvisGroup[i].category(getLocName).categoryScale().domain([d.filter]).range([locColorScale(d.filter)]);
				});
				ordervis.metadata1(function (d) {
					return d.scene_metadata.location;
				});
				ordervis.meta1ColorScale().domain(locNames).range(loc_order_palette);

				var timeNames = timedata.map(function (d) {
					return d.filter;
				});
				var timeColorScale = d3.scaleOrdinal().domain(timeNames).range(time_palette);
				timedata.forEach(function (d, i) {
					timevisGroup[i].category(getTimeName).categoryScale().domain([d.filter]).range([timeColorScale(d.filter)]);
				});
				ordervis.metadata2(function (d) {
					return d.scene_metadata.time;
				});
				ordervis.meta2ColorScale().domain(timeNames).range(time_palette);

				ordervis.isHighlighted(highlightAll);
			} else {
				ordervis.children(function (d, i) {
					return ['scene-' + i];
				});
				ordervis.metadata1(function () {
					return null;
				});
				ordervis.metadata2(function () {
					return null;
				});
				ordervis.categoryScale().domain([]).range(default_palette);
				ordervis.isHighlighted(highlightCooccur);

				locvisGroup.concat(locvisGroup).forEach(function (vis) {
					vis.category(getLocName).categoryScale().domain([]).range(['#00B5AD']);
				});
			}
		}
		function switchCharVis() {

			if ($scope.charColor == _constants.COLOR_GENDER) {
				charvisGroup.forEach(function (vis) {
					vis.category(getGender).categoryScale().domain(gender).range(gender_palette);
				});
			} else if ($scope.charColor == _constants.COLOR_SENTIMENT) {
				charvisGroup.forEach(function (vis) {
					vis.category(getSentiment).categoryScale().domain(sentiment).range(sentiment_palette);
				});
			} else if ($scope.charColor == _constants.COLOR_CHARACTERS) {
				var charNames = chardata.map(function (d) {
					return d.filter;
				});
				var charColorScale = d3.scaleOrdinal().domain(charNames).range(character_palette);
				// character
				chardata.forEach(function (d, i) {
					charvisGroup[i].category(getCharName).categoryScale().domain([d.filter]).range([charColorScale(d.filter)]);
				});
			}
		}
		angular.element($window).bind('resize', function () {
			var width = angular.element('#visContainer').width();
			// console.log('prevWidth, width='+prevWidth + ', '+ width);
			if (Math.abs(prevWidth - width) > 0.001) {
				// console.log('Resizing vis...');
				allVisGroup.forEach(function (vis) {
					return vis.width(width);
				});
				updateVis();
				prevWidth = width;
			}
		});
		$scope.revert = function () {
			$log.debug('revert');
			$scope.ordering = $scope.ordering == _constants.STORY ? _constants.NARRATIVE : _constants.STORY;
			// console.log($scope.ordering);
			var temp = ordervis.orderX();
			ordervis.orderX(ordervis.orderY());
			ordervis.orderY(temp);
			if ($scope.ordering == _constants.STORY) {
				ordervis.xtitle('Story order →');
				ordervis.ytitle('← Narrative order');
				allVisGroup.filter(function (vis) {
					return vis.constructor.name == 'MetaVis';
				}).forEach(function (vis) {
					return vis.order(function (d) {
						return d.story_order;
					});
				});
			} else {
				ordervis.xtitle('Narrative order →');
				ordervis.ytitle('← Story order');
				allVisGroup.filter(function (vis) {
					return vis.constructor.name == 'MetaVis';
				}).forEach(function (vis) {
					return vis.order(function (d) {
						return d.narrative_order;
					});
				});
			}
			$scope.showLoader = true;

			$timeout(function () {
				$scope.script = _helper2.default.getScriptData($scope.scriptinfo, $scope.ordering);
				updateVis();
			});
		};
		$scope.panning = function (tx) {
			$log.debug('panning');
			allVisGroup.forEach(function (vis) {
				return vis.transform('translateBy', tx);
			});
		};
		$scope.zooming = function (k) {
			$log.debug('zooming');
			allVisGroup.forEach(function (vis) {
				return vis.transform('scaleBy', k);
			});
		};
		$scope.reset = function () {
			$log.debug('reset');
			allVisGroup.forEach(function (vis) {
				return vis.transform('transform', d3.zoomIdentity);
			});
		};
		$scope.highlightSceneInScript = function (order, highlight) {
			// console.log('highlight-scene: '+order);
			$('#script-view').find('#scene-' + order).toggleClass(_style2.default.sceneViewHover, highlight);
		};
		$scope.onOverScene = function (e, scene) {
			var order = $scope.ordering == _constants.STORY ? scene.so : scene.no;
			// console.log($scope.ordering, ',', order);
			// $scope.highlightSceneInScript(order, true);
			if ($scope.ordering == _constants.STORY) {
				$('#script-view').find('#scene-' + order).find('.' + _style2.default.sceneHandle).show();
			}
			onMouseOver.call(null, { order: order });
		};
		$scope.onOutScene = function (e, scene) {
			var order = $scope.ordering == _constants.STORY ? scene.so : scene.no;
			// $scope.highlightSceneInScript(order, false);
			if ($scope.ordering == _constants.STORY) {
				$('#script-view').find('#scene-' + order).find('.' + _style2.default.sceneHandle).hide();
			}
			onMouseOut.call(null, { order: order });
		};
		$scope.onClickScene = function (e) {
			angular.element(e.currentTarget).find('.' + _style2.default.sceneContent).toggleClass(_style2.default.showSceneContent);
		};
		$scope.onClickSceneLength = function () {
			$scope.showSceneLength = !$scope.showSceneLength;
			if ($scope.showSceneLength) {
				allVisGroup.forEach(function (vis) {
					return vis.size(function (d) {
						return d.scene_metadata.size;
					});
				});
			} else {
				allVisGroup.forEach(function (vis) {
					return vis.size(function () {
						return 1;
					});
				});
			}
			updateVis();
		};

		$scope.onClickRichView = function () {
			$scope.showRichView = !$scope.showRichView;

			toggleRichView();
			updateOrderVis();
		};
		$scope.charColorSelected = function (value) {

			if ($scope.charColor != value) {
				$scope.charColor = value;
				switchCharVis();
				toggleRichView();
				if ($scope.showRichView) {
					updateOrderVis();
				}
				updateCharVis();
			}
		};
		$scope.onClickToggleCharacters = function () {
			console.log('toggle');
			$scope.toggleCharacters = !$scope.toggleCharacters;
			if ($scope.toggleCharacters) {
				chardata.forEach(function (d) {
					return selected.indexOf(d) == -1 && selected.push(d);
				});
			} else {
				chardata.forEach(function (d) {
					return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
				});
			}
			ordervis.highlights(selected);
		};
		$scope.onClickToggleLocations = function () {
			$scope.toggleLocations = !$scope.toggleLocations;
			if ($scope.toggleLocations) {
				locdata.forEach(function (d) {
					return selected.indexOf(d) == -1 && selected.push(d);
				});
			} else {
				locdata.forEach(function (d) {
					return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
				});
			}
			ordervis.highlights(selected);
		};
		$scope.onClickToggleTimes = function () {
			$scope.toggleTimes = !$scope.toggleTimes;
			if ($scope.toggleTimes) {
				timedata.forEach(function (d) {
					return selected.indexOf(d) == -1 && selected.push(d);
				});
			} else {
				timedata.forEach(function (d) {
					return selected.indexOf(d) > -1 && selected.splice(selected.indexOf(d), 1);
				});
			}
			ordervis.highlights(selected);
		};
		$scope.getClass = function (tag) {
			// console.log(tag)
			switch (tag) {
				case _constants.SCENE_HEADING:
					return _style2.default.sceneHeading;
				case _constants.ACTION:
					return _style2.default.action;
				case _constants.CHARACTER_NAME:
					return _style2.default.characterName;
				case _constants.DIALOGUE:
					return _style2.default.dialogue;
				case _constants.PARENTHETICAL:
					return _style2.default.parenthetical;
				case _constants.IGNORE:
					return _style2.default.ignore;
				default:
					return '';
			}
		};
	});

	exports.default = module.name;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var core = __webpack_require__(4);
	var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
	module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	var core = module.exports = { version: '2.5.3' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = "<div class=\"ui container\" style=\"margin-top:25px;\">\n  <div class=\"ui inverted dimmer\" ng-class=\"{active: showLoader}\">\n    <div class=\"ui small text loader\">Loading</div>\n  </div>\n  <!-- <div>\n    <svg height=\"0\" width=\"0\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">\n      <defs>\n        <pattern id=\"crosshatch\" patternUnits=\"userSpaceOnUse\" width=\"10\" height=\"10\">\n          <line x1=\"0\" y1=\"0\" x2=\"8\" y2=\"8\" style=\"stroke:black; stroke-width:1;vector-effect: non-scaling-stroke;\" />\n          <line x1=\"0\" y1=\"8\" x2=\"3\" y2=\"0\" style=\"stroke:black; stroke-width:1;vector-effect: non-scaling-stroke;\" />\n        </pattern>\n        <pattern id=\"lightstripe\" patternUnits=\"userSpaceOnUse\" width=\"10\" height=\"10\" patternTransform=\"rotate(45)\">\n          <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"10\" style=\"stroke:black; stroke-width:2;vector-effect: non-scaling-stroke;\" />\n\n        </pattern>\n        <pattern id=\"verticalstripe\" patternUnits=\"userSpaceOnUse\" width=\"3\" height=\"3\" patternTransform=\"rotate(-45)\">\n          <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"10\" style=\"stroke:black; stroke-width:2;vector-effect: non-scaling-stroke;\" />\n        </pattern>\n        <pattern id=\"houndstooth\" patternUnits=\"userSpaceOnUse\" width=\"10\" height=\"10\" patternTransform=\"rotate(90)\">\n          <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"10\" style=\"stroke:black; stroke-width:2;vector-effect: non-scaling-stroke;\" />\n        </pattern>\n      </defs>\n    </svg>\n  </div> -->\n  <div class=\"ui stackable grid\" style=\"margin-top:20px;\">\n    <!-- <div class=\"eleven wide column\">\n\n    </div>\n    <div class=\"five wide column\">\n\n    </div> -->\n\n    <div id=\"visContainer\" class=\"doubling eleven wide column\" style=\"padding-top:0px;\">\n      <div>\n        <div id=\"select-movie\" class=\"ui inline dropdown\" style=\"border-bottom:2px solid black;\">\n          <h1 class=\"ui header text\" style=\"margin-bottom:0px;\"></h1>\n          <i class=\"dropdown icon\"></i>\n          <div class=\"menu\">\n            <div class=\"item\" data-value=\"{{t.data_url}}\" ng-repeat=\"t in titles\">{{t.title}}</div>\n          </div>\n        </div>\n        <p ng-class=\"css.movieInfo\" style=\"margin-top:15px;\">\n          <!-- {{movieinfo.tagline}} <br> -->\n          <!-- <i class=\"yellow star icon\"></i> -->\n          <!-- {{movieinfo.vote_average}}/10 ({{movieinfo.vote_count}} votes) -->\n          {{movieinfo.genre}}\n          <!-- &nbsp; <span style=\"color:#EEEEEE\">|</span> &nbsp;  {{movieinfo.runtime}} min -->\n          &nbsp; <span style=\"color:#EEEEEE\">|</span> &nbsp; {{movieinfo.release_date}} &nbsp; <span style=\"color:#EEEEEE\">|</span> &nbsp; Directed by {{movieinfo.director.name}} &nbsp; <span style=\"color:#EEEEEE\">|</span> &nbsp; Nonlinearity {{complexity\n          | number:2}}\n          <!-- Kewords: {{movieinfo.keyword}} <br> -->\n          &nbsp; <span style=\"color:#EEEEEE\">|</span> &nbsp;\n          <a class=\"ui small blue basic label\" target=\"_blank\" ng-href=\"https://www.imdb.com/title/{{movieinfo.imdb_id}}\" style=\"padding:4px;\">\n            <i class=\"film icon\" style=\"margin-right:4px;\"></i> iMDB\n          </a>\n        </p>\n      </div>\n      <div class=\"options\" style=\"margin-top:20px;\">\n        <div class=\"ui mini form\">\n          <div class=\"inline fields\" style=\"margin:0px;\">\n            <div class=\"field\">\n              <button class=\"ui basic small compact icon button\" style=\"margin:0px; margin-right:10px;\" ng-click=\"revert()\" data-variation=\"tiny\" data-content=\"Revert axes\">\n                <i class=\"refresh icon\"></i>\n              </button>\n              <button class=\"ui basic small compact icon button\" style=\"margin:0px;\" ng-click=\"panning(10)\" data-variation=\"tiny\" data-content=\"Pan left\">\n                <i class=\"arrow left icon\"></i>\n              </button>\n              <button class=\"ui basic small compact icon button\" style=\"margin:0px;\" ng-click=\"panning(-10)\" data-variation=\"tiny\" data-content=\"Pan right\">\n                <i class=\"arrow right icon\"></i>\n              </button>\n              <button class=\"ui basic small compact icon button\" style=\"margin:0px;\" ng-click=\"zooming(1.1)\" data-variation=\"tiny\" data-content=\"Zoom in\">\n                <i class=\"zoom icon\"></i>\n              </button>\n              <button class=\"ui basic small compact icon button\" style=\"margin:0px;\" ng-click=\"zooming(0.9)\" data-variation=\"tiny\" data-content=\"Zoom out\">\n                <i class=\"zoom out icon\"></i>\n              </button>\n              <button class=\"ui basic small compact icon button\" style=\"margin:0px;\" ng-click=\"reset()\" data-variation=\"tiny\" data-content=\"Reset zoom\">\n                <i class=\"compress icon\"></i>\n              </button>\n            </div>\n            <div class=\"field\">\n              <div class=\"ui basic small compact icon button\" style=\"border:none;\" data-variation=\"tiny\" data-content=\"Show scene length, the number of letters per each scene.\" ng-click=\"onClickSceneLength()\">\n                <i class=\"toggle icon\" ng-class=\"showSceneLength?'on':'off'\" style=\"margin-right:5px;\"></i> Scene Length\n              </div>\n            </div>\n            <div class=\"field\">\n              <div class=\"ui basic small compact icon button\" style=\"border:none;\" data-variation=\"tiny\" data-content=\"Show all metadata on the story curve\" ng-click=\"onClickRichView()\">\n                <i class=\"toggle icon\" ng-class=\"showRichView?'on':'off'\" style=\"margin-right:5px;\"></i> RichView\n              </div>\n            </div>\n            <div class=\"field\">\n              <!-- <div id=\"check-sentiment\" class=\"ui slider checkbox\" data-tooltip=\"Positive: green, Negative: red, Neutral: yellow\">\n                <input type=\"checkbox\" checked=\"true\">\n                <label>Dialogue sentiment</label>\n              </div> -->\n              <div id=\"select-scene-color\" class=\"ui selection dropdown\" data-variation=\"tiny\" data-content=\"Choose the color coding of the characters.\" style=\"font-size:14px; line-height: 0.6em; min-height:2.0142em; min-width:8.0em;\">\n                <i class=\"dropdown icon\"></i>\n                <div class=\"default text\"></div>\n                <div class=\"menu\">\n                  <div class=\"item\" data-value=\"1\" style=\"font-size:14px;\">Gender</div>\n                  <div class=\"item\" data-value=\"2\" style=\"font-size:14px;\">Sentiment</div>\n                  <div class=\"item\" data-value=\"3\" style=\"font-size:14px;\">Characters</div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div id=\"ordervis\" style=\"margin-top:0px;\">\n      </div>\n      <div class=\"ui accordion\" style=\"margin-top:-15px\">\n        <div class=\"title active\" ng-class=\"css.accordionTitle\">\n          <!-- <i class=\"tiny dropdown icon\"></i> -->\n          Characters\n          <i class=\"grey icon\" ng-class=\"toggleCharacters?'check square':'square outline'\" ng-click=\"$event.stopPropagation();onClickToggleCharacters()\"></i>\n          <!-- <div class=\"ui left pointing mini compact basic label\">\n            Select All\n          </div> -->\n          <!-- (<a style=\"font-weight:normal\" ng-click=\"$event.stopPropagation()\">select all</a>) -->\n        </div>\n        <div id=\"charactervis\" class=\"content active\" ng-class=\"css.accordionContent\">\n        </div>\n\n        <div class=\"title active\" ng-class=\"css.accordionTitle\">\n          <!-- <i class=\"huge dropdown icon\"></i> -->\n          Location\n          <i class=\"grey icon\" ng-class=\"toggleLocations?'check square':'square outline'\" ng-click=\"$event.stopPropagation();onClickToggleLocations()\"></i>\n        </div>\n        <div id=\"locvis\" class=\"content active\" ng-class=\"css.accordionContent\">\n        </div>\n\n        <!-- <div class=\"title active\" ng-class=\"css.accordionTitle\">\n          Interior/Exterior\n        </div>\n        <div id=\"intextvis\" class=\"content active\" ng-class=\"css.accordionContent\">\n        </div> -->\n\n        <div class=\"title active\" ng-class=\"css.accordionTitle\">\n          <!-- <i class=\"huge dropdown icon\"></i> -->\n          Time of Day\n          <i class=\"grey icon\" ng-class=\"toggleTimes?'check square':'square outline'\" ng-click=\"$event.stopPropagation();onClickToggleTimes()\"></i>\n        </div>\n\n        <div id=\"timevis\" class=\"content active\" ng-class=\"css.accordionContent\">\n        </div>\n      </div>\n    </div>\n    <div id=\"scriptContainer\" class=\"doubling five wide column\" style=\"padding-top:0px;\">\n      <img ng-class=\"[css.backdropImg]\" width=\"100%\" ng-src=\"{{movieinfo.backdrop_path}}\">\n      <div id=\"script-view\" ng-class=\"[css.scriptView]\">\n        <div id=\"scene-{{$index}}\" draggable=\"false\" ng-class=\"[css.sceneView]\" ng-repeat=\"scene in script\" ng-mouseenter=\"onOverScene($event, scene)\" ng-mouseleave=\"onOutScene($event, scene)\" ng-click=\"onClickScene($event, scene)\" on-finish-render=\"onScriptRendered\">\n          <div id=\"heading-{{$index}}\" ng-class=\"[css.sceneHeading]\">\n            <i ng-class=\"[css.sceneHandle, 'move icon']\" style=\"display:none;\"></i> {{scene.heading}}\n          </div>\n          <div id=\"scene-content-{{$index}}\" ng-class=\"[css.sceneContent]\">\n            <div ng-class=\"getClass(segment.tag)\" ng-repeat=\"segment in scene.segments\">\n              <div ng-class=\"css.charImgCrop\" ng-if=\"segment.imgUrl!=null\">\n                <img ng-src=\"{{segment.imgUrl}}\">\n              </div>\n              <span>{{segment.content}}</span>\n            </div>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n</div>\n";

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"movieInfo":"_1U-6c3yVSUze_ayy32nvtY","backdropImg":"PoeQ6X2mQkx3QIxa1sIXY","scriptView":"_1GYTh50toxjbPsCMrzO5K2","sceneView":"_1BWZUlHlVJWVbKjIAgoS10","sceneViewHover":"_1dDSABAdMj1sjzZeF5Iecl","sceneHeading":"PLYSLY0gG_RkXyqyXlDuX","sceneHandle":"_27PtreKHltmci5R71HttTV","sceneContent":"_2Q8diMe_W1XElqlL4BGC99","showSceneContent":"_364h0ma2XNkGwOgtWbtDRr","action":"_1eFws_KRHOIQ1oUZP0D7mo","dialogue":"_3ZMlG57EVZxkx4ONvOXgQO","parenthetical":"_1c-3EJcEOSYvrRQCkHTjUr","characterName":"fiN3--CF6QlRs0oIkf7GL","charImgCrop":"_2tt9g3boQEiLfQg5UdWon0","ignore":"_3G9HJmJCnlYL3efuE-0sPg","sortableGhost":"_3TMloq-_tUTBuFH81PlWG","accordionTitle":"_2QiDB0jMQJhEtJnTUjudf4","accordionContent":"_3XBh4iP31BdT2qq6jpg3rT"};

/***/ }),
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _map = __webpack_require__(11);

	var _map2 = _interopRequireDefault(_map);

	var _classCallCheck2 = __webpack_require__(85);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(86);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _ordervis = __webpack_require__(90);

	var _ordervis2 = _interopRequireDefault(_ordervis);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var ONZOOM = 'zoom';
	var ONMOUSEOVER = 'mouseover';
	var ONMOUSEOUT = 'mouseout';
	var ONMOUSECLICK = 'click';
	var METADATA1 = 1;
	var METADATA2 = 1;
	var CHILDDATA = 1;

	// private functions
	var helper = {
		axisStyleUpdate: function axisStyleUpdate(selection) {
			var xaxisContainer = selection.select('.x.axis');
			xaxisContainer.select('.domain').classed(_ordervis2.default.axisDomain, true);
			xaxisContainer.selectAll('.tick line').classed(_ordervis2.default.xaxisTickLine, true);
			xaxisContainer.selectAll('.tick text').classed(_ordervis2.default.axisText, true);

			var yaxisContainer = selection.select('.y.axis');
			yaxisContainer.select('.domain').classed(_ordervis2.default.axisDomain, true);
			yaxisContainer.selectAll('.tick line').classed(_ordervis2.default.yaxisInnerTickLine, true);
			yaxisContainer.selectAll('.tick text').classed(_ordervis2.default.axisText, true).attr('dy', -4);
		}
	};

	var OrderVis = function () {
		(0, _createClass3.default)(OrderVis, null, [{
			key: 'METADATA1',
			get: function get() {
				return METADATA1;
			}
		}, {
			key: 'METADATA2',
			get: function get() {
				return METADATA2;
			}
		}, {
			key: 'CHILDDATA',
			get: function get() {
				return CHILDDATA;
			}
		}]);

		function OrderVis(selector) {
			(0, _classCallCheck3.default)(this, OrderVis);

			this._container = selector ? d3.select(selector) : null;
			this._width = 800;
			this._height = 300;
			this._margin = {
				top: 0,
				left: 0,
				right: 0,
				bottom: 10
			};
			this._duration = 400; // animation duration
			this._zoom = d3.zoom();

			this._xs = d3.scaleLinear();
			this._ys = d3.scaleLinear();
			this._cs = d3.scaleOrdinal().range(['#00B5AD']);

			this._csm1 = d3.scaleOrdinal().range(['#f2711c']);
			this._csm2 = d3.scaleOrdinal().range(['#a333c8']);

			this._xaxis = d3.axisTop();
			this._yaxis = d3.axisLeft();
			this._xtitle = 'Narrative order →';
			this._ytitle = '← Story order';

			this._palette = ['#00B5AD'];

			this._listners = new _map2.default();

			this._highlights = [];

			this._tip = d3.tip().attr('class', _ordervis2.default.d3Tip).offset([0, 10]).direction('e').html(this._tipFormat);
		}

		(0, _createClass3.default)(OrderVis, [{
			key: 'draw',
			value: function draw(data) {
				var _this = this;

				if (this._container.empty()) {
					return;
				}

				this._container.datum(data);

				// console.log('---------- OrderVis ----------');

				var width = this._width - this._margin.left - this._margin.right;
				var height = this._height - this._margin.top - this._margin.bottom;
				var xpadding = 80; //axes padding
				var ypadding = 40; //axes padding
				var markHeight = 8;

				// create root container
				var svg = this._container.select('svg');
				if (svg.empty()) {
					// init
					svg = this._container.append('svg');
					svg.append('g').attr('class', 'visarea').append('defs').append('clipPath').attr('id', 'clipID' + Date.now()).append('rect').attr('x', xpadding).attr('y', ypadding);
					// svg.append('defs')
					// 	.append('pattern')
					// 	.attr('id', 'crosshatch')
					// 	.attr('width', 8)
					// 	.attr('height', 8)
					// 	.attr('patternUnits', 'userSpaceOnUse')
					// 	.append('image')
					// 	.attr('xlink:href', 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><path fill="#fff" d="M0 0h8v8h-8z"/><path d="M0 0l8 8zm8 0l-8 8z" stroke-width=".5" stroke="#aaa"/></svg>')
					// 	.attr('vector-effect', 'non-scaling-stroke')
					// 	.attr('x', 0)
					// 	.attr('y', 0)
					// 	.attr('width', 8)
					// 	.attr('height', 8);


					svg.call(this._tip);
				}
				var g = svg.select('.visarea');
				// update vis size
				svg.attr('width', this._width).attr('height', this._height);
				g.attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
				g.select('clipPath').select('rect').attr('width', width - xpadding).attr('height', height - ypadding + markHeight);

				// strong assumption: there should be one svg per selection!
				// svg = svgEnter.merge(svg);
				// let tooltip = d3.select(this).select('.tooltip');
				// if (tooltip.empty()) {
				// 	this.createTooltip(d3.select(this)); //replace with d3.tip
				// }

				// define scales
				this._xs.domain([0, d3.sum(data, this._size)]).range([xpadding, width]);

				this._ys.domain([0, d3.max(data, this._orderY)]).range([ypadding, height - markHeight]);

				// let categories = d3.set(data.reduce((acc, d)=>
				// 	acc.concat(this._children(d).map(
				// 		c=>this._childCategory(c))),[])).values();
				// // console.log(categories);
				// this._cs.domain(categories.sort())
				// 	.range(this._palette);
				// compute layout
				var cursor = 0;
				var markData = data.sort(function (d1, d2) {
					return _this._orderX(d1) - _this._orderX(d2);
				}).map(function (d) {
					var x0 = _this._xs(cursor);
					cursor += _this._size(d);
					var x1 = _this._xs(cursor);
					var y = _this._ys(_this._orderY(d));
					// children layout
					var children = _this._children(d).map(function (c, i) {
						return {
							orgData: c,
							parentOrgDdata: d,
							x0: x0,
							x1: x1,
							y: y + i * markHeight
						};
					});
					return {
						orgData: d,
						children: children,
						x0: x0,
						x1: x1,
						y: y,
						id: _this._orderX(d),
						xo: _this._orderX(d),
						yo: _this._orderY(d)
					};
				});

				// construct axes
				var xaxisContainer = g.select('.x.axis');
				if (xaxisContainer.empty()) {
					xaxisContainer = g.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + ypadding + ')');
				}

				this._xaxis.scale(this._xs);
				xaxisContainer.call(this._xaxis);

				var yaxisContainer = g.select('.y.axis');
				if (yaxisContainer.empty()) {
					yaxisContainer = g.append('g').attr('class', 'y axis').attr('transform', 'translate(' + xpadding + ',0)');
				}

				var ydivide = Math.round(d3.max(markData.map(function (d) {
					return d.yo;
				})) / 3);

				this._yaxis.scale(this._ys).tickValues([ydivide, 2 * ydivide, 3 * ydivide]).tickSizeInner(-(width - xpadding)).tickSizeOuter(0);
				yaxisContainer.call(this._yaxis);

				helper.axisStyleUpdate(this._container);

				// draw axis labels
				if (g.select('.' + _ordervis2.default.bgLine).empty()) {
					g.append('line').attr('class', _ordervis2.default.bgLine).attr('x1', 0).attr('x2', xpadding).attr('y1', ypadding).attr('y2', ypadding);
				}

				var axisTitles = g.selectAll('.' + _ordervis2.default.axisLegend).data([[width, 0, 0, this._xtitle, 'end'], [0, height - 10, -90, this._ytitle, 'start']]);
				axisTitles.enter().append('text').attr('class', _ordervis2.default.axisLegend).merge(axisTitles).text(function (d) {
					return d[3];
				}).attr('text-anchor', function (d) {
					return d[4];
				}).attr('transform', function (d) {
					return 'translate(' + d[0] + ',' + d[1] + ')rotate(' + d[2] + ')';
				});

				// draw background
				var bandSize = this._ys(ydivide) - ypadding;
				var bgdata = [[0, 0.04, 'Beginning'], [bandSize, 0.12, 'Middle'], [2 * bandSize, 0.2, 'End']];

				var bgpanels = g.selectAll('.bgpanel').data(bgdata);

				var bgpanelEnter = bgpanels.enter().append('g').attr('class', 'bgpanel');

				// bgpanelEnter.append('rect')
				// 	.style('fill', '#9E9E9E')
				// 	.merge(bgpanels.select('rect'))
				// 	.style('fill-opacity', d=>d[1])
				// 	.attr('x', xpadding)
				// 	.attr('y', d=>ypadding+d[0])
				// 	.attr('height', bandSize)
				// 	.attr('width', width-xpadding);

				bgpanelEnter.append('text').text(function (d) {
					return d[2];
				}).attr('class', _ordervis2.default.bgText).merge(bgpanels.select('text')).attr('transform', function (d) {
					return 'translate(' + xpadding / 2 + ',' + (ypadding + d[0] + bandSize / 2.0) + ')';
				});

				bgpanelEnter.append('line').attr('class', _ordervis2.default.bgLine).merge(bgpanels.select('line')).attr('stroke-dasharray', '3,3').attr('x1', 20).attr('x2', xpadding).attr('y1', function (d) {
					return ypadding + d[0] + bandSize;
				}).attr('y2', function (d) {
					return ypadding + d[0] + bandSize;
				});

				// main group containing marks (to be zoomed and panned)
				var main = g.select('.main');
				if (main.empty()) {
					main = g.append('g').attr('clip-path', 'url(#' + g.select('clipPath').attr('id') + ')').append('g').attr('class', 'main');
				}

				// draw line connecting marks
				var lineData = markData.reduce(function (l, d) {
					l.push([d.x0, d.y]);
					l.push([d.x1, d.y]);
					return l;
				}, []);

				var line = d3.line().x(function (d) {
					return d[0];
				}).y(function (d) {
					return d[1];
				});

				var linePath = main.select('.' + _ordervis2.default.connectLine);
				if (linePath.empty()) {
					linePath = main.append('path').attr('class', _ordervis2.default.connectLine).attr('stroke', 'url(#svgGradient)');
				}
				linePath.datum(lineData).attr('d', line);

				// draw rect marks
				var sceneUpdate = main.selectAll('.sceneGroup').data(markData, function (d) {
					return d.id;
				});

				sceneUpdate.exit().remove();

				var sceneEnter = sceneUpdate.enter().append('g').attr('class', 'sceneGroup');

				sceneEnter.append('rect').attr('class', _ordervis2.default.overlay).on(ONMOUSEOVER, function (d, i, ns) {
					return _this._onMouseOver(d, i, ns);
				}).on(ONMOUSEOUT, function (d, i, ns) {
					return _this._onMouseOut(d, i, ns);
				}).on(ONMOUSECLICK, function (d, i, ns) {
					return _this._onMouseClick(d, i, ns);
				});

				sceneEnter.append('rect').attr('class', _ordervis2.default.overlayHorz);

				sceneEnter.append('rect').attr('pointer-events', 'none').attr('class', _ordervis2.default.longBand);

				sceneEnter.append('rect').attr('pointer-events', 'none').attr('class', _ordervis2.default.shortBand);

				// multiple children
				sceneEnter.append('g').attr('class', 'characters');

				sceneUpdate = sceneEnter.merge(sceneUpdate);

				sceneUpdate.select('.' + _ordervis2.default.overlay).attr('x', function (d) {
					return d.x0;
				}).attr('y', ypadding).attr('height', height - ypadding - markHeight).attr('width', function (d) {
					return d.x1 - d.x0;
				});

				sceneUpdate.select('.' + _ordervis2.default.overlayHorz).attr('x', xpadding).attr('y', function (d) {
					return d.y;
				}).attr('height', markHeight).attr('width', width);

				sceneUpdate.select('.' + _ordervis2.default.shortBand).attr('x', function (d) {
					return d.x0;
				}).style('fill-opacity', function (d) {
					return _this._isHighlighted({
						type: METADATA1,
						data: _this._metadata1(d.orgData)
					}, d.orgData, _this._highlights) ? 1.0 : 0.0;
				}).style('fill', function (d) {
					return _this._csm1(_this._metadata1(d.orgData));
				}) //d =>
				.attr('y', function (d) {
					return d.y;
				}).attr('width', 0).attr('height', 0).transition().attr('y', function (d) {
					return d.y - 5 * markHeight;
				}).duration(this._duration).attr('width', function (d) {
					return d.x1 - d.x0;
				}).attr('height', markHeight * 11); //d=>markHeight*(this._children(d.orgData).length+10))

				sceneUpdate.select('.' + _ordervis2.default.longBand).attr('x', function (d) {
					return d.x0;
				}).attr('y', ypadding).attr('width', function (d) {
					return d.x1 - d.x0;
				}).style('fill', function (d) {
					return _this._csm2(_this._metadata2(d.orgData));
				}).style('fill-opacity', function (d) {
					return _this._isHighlighted({
						type: METADATA2,
						data: _this._metadata2(d.orgData)
					}, d.orgData, _this._highlights) ? 0.25 : 0.0;
				}).attr('height', 0).transition().duration(this._duration).attr('height', height - ypadding - markHeight);

				var characters = sceneUpdate.select('.characters').selectAll('.' + _ordervis2.default.mark).data(function (d) {
					return d.children;
				});

				characters.exit().remove();

				characters.enter().append('rect').attr('class', _ordervis2.default.mark).attr('pointer-events', 'none').attr('x', function (d) {
					return d.x0;
				}).attr('y', function (d) {
					return d.y;
				}).merge(characters).transition().duration(this._duration).style('fill-opacity', function (d) {
					return _this._isHighlighted({
						type: CHILDDATA,
						data: d.orgData
					}, d.parentOrgDdata, _this._highlights) ? 1.0 : 0.15;
				}).attr('fill', function (d) {
					return _this._cs(_this._childCategory(d.orgData, d.parentOrgDdata));
				}).attr('x', function (d) {
					return d.x0;
				}).attr('y', function (d) {
					return d.y;
				}).attr('width', function (d) {
					return d.x1 - d.x0;
				}).attr('height', markHeight).attr('y', function (d) {
					return d.y;
				});

				// zoom setting
				g.call(this._zoom); //attach zoom to the vis area

				this._zoom.extent([[xpadding, 0], [width, height]]).translateExtent([[xpadding, 0], [width, height]]).scaleExtent([1, 15]);

				this._zoom.on('zoom', function () {
					return _this._onZoom();
				});
			}
		}, {
			key: '_children',
			value: function _children(d, i) {
				return ['scene-' + i];
			}
		}, {
			key: '_childCategory',
			value: function _childCategory(d) {
				return d;
			}
		}, {
			key: '_metadata1',
			value: function _metadata1(d) {
				return d.scene_metadata.location;
			}
		}, {
			key: '_metadata2',
			value: function _metadata2(d) {
				return d.scene_metadata.time;
			}
		}, {
			key: '_orderX',
			value: function _orderX(d) {
				return d.narrative_order;
			}
		}, {
			key: '_orderY',
			value: function _orderY(d) {
				return d.story_order;
			}
		}, {
			key: '_size',
			value: function _size(d) {
				return d.scene_metadata.size;
			}
		}, {
			key: '_onZoom',
			value: function _onZoom() {
				this._transformVis(d3.event.transform);
				if (this._listners[ONZOOM]) {
					this._listners[ONZOOM].call(this, d3.event.transform);
				}
			}
		}, {
			key: '_transformVis',
			value: function _transformVis(transform) {
				this._tip.hide();
				this._container.select('.x.axis').call(this._xaxis.scale(transform.rescaleX(this._xs)));

				this._container.select('.main').attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');

				helper.axisStyleUpdate(this._container);
			}
		}, {
			key: 'transform',
			value: function transform(op, param) {
				var _this2 = this;

				// does not call callback
				this._zoom.on('zoom', null);
				//update zoom state
				var zoomContainer = this._container.select('.visarea');
				this._container.select('.visarea').call(this._zoom[op], param);
				// update vis
				var transform = d3.zoomTransform(zoomContainer.node());
				this._transformVis(transform);
				this._zoom.on('zoom', function () {
					return _this2._onZoom();
				});
				return this;
			}
		}, {
			key: '_onMouseClick',
			value: function _onMouseClick() {
				if (this._listners[ONMOUSECLICK]) {
					this._listners[ONMOUSECLICK].apply(this, arguments);
				}
			}
		}, {
			key: '_onMouseOver',
			value: function _onMouseOver() {
				this.highlightOn(arguments[0].xo);

				if (this._listners[ONMOUSEOVER]) {
					this._listners[ONMOUSEOVER].apply(this, arguments);
				}
			}
		}, {
			key: '_onMouseOut',
			value: function _onMouseOut() {
				this.highlightOff(arguments[0].xo);

				if (this._listners[ONMOUSEOUT]) {
					this._listners[ONMOUSEOUT].apply(this, arguments);
				}
			}
		}, {
			key: '_tipFormat',
			value: function _tipFormat(d) {
				var content = '<table>';
				content += '<tr><td><span style="color:#FBBD08">(X,Y)</span></td><td>&nbsp; ' + d.xo + ', ' + d.yo + '</td></tr>';
				// content += ('<tr><td><span style="color:#767676">S.order</span></td><td>&nbsp; ' + d.so + '</td></tr>');
				content += '</table>';
				return content;
			}
		}, {
			key: 'highlightOn',
			value: function highlightOn(xo) {
				var _this3 = this;

				var g = this._container.selectAll('.sceneGroup').filter(function (d) {
					return d.xo == xo;
				}).raise();

				g.select('.' + _ordervis2.default.overlay).style('fill-opacity', 0.2);
				g.select('.' + _ordervis2.default.overlayHorz).style('fill-opacity', 0.2);
				g.select('.' + _ordervis2.default.shortBand).each(function (d, i, ns) {
					return _this3._tip.show(d, ns[i]);
				});

				g.selectAll('.' + _ordervis2.default.mark).classed(_ordervis2.default.highlight, true);

				// if (!this._highlights){
				// 	return;
				// }
				// // retrieve all characters
				// let coappear = this._container.selectAll('.sceneGroup')
				// 	.filter((d) => this._isHighlighted(d.scene, this._highlights));
				//
				// coappear.select('.'+css.mark)
				// 	.classed(css.coappeared, true);
			}
		}, {
			key: 'highlightOff',
			value: function highlightOff(xo) {
				var _this4 = this;

				var g = this._container.selectAll('.sceneGroup').filter(function (d) {
					return d.xo == xo;
				}).raise();
				g.select('.' + _ordervis2.default.overlay).style('fill-opacity', 0.0);
				g.select('.' + _ordervis2.default.overlayHorz).style('fill-opacity', 0.0);
				g.select('.' + _ordervis2.default.shortBand).each(function (d, i, ns) {
					return _this4._tip.hide(d, ns[i]);
				});
				g.selectAll('.' + _ordervis2.default.mark).classed(_ordervis2.default.highlight, false);
			}
		}, {
			key: '_isHighlighted',
			value: function _isHighlighted(d, highlights) {
				return highlights.length == 0 ? true : highlights.every(function (h) {
					return h.type == 'characters' ? d[h.type].includes(h.filter) : d.scene_metadata[h.type] == h.filter;
				});
			}
		}, {
			key: 'highlights',
			value: function highlights(_) {
				var _this5 = this;

				if (!arguments.length) return this._highlights;
				this._highlights = _;

				//highlight marks
				this._container.selectAll('.sceneGroup').select('.' + _ordervis2.default.shortBand).style('fill-opacity', function (d) {
					return _this5._isHighlighted({
						type: METADATA1,
						data: _this5._metadata1(d.orgData)
					}, d.orgData, _this5._highlights) ? 1.0 : 0.0;
				});

				this._container.selectAll('.sceneGroup').select('.' + _ordervis2.default.longBand).style('fill-opacity', function (d) {
					return _this5._isHighlighted({
						type: METADATA2,
						data: _this5._metadata2(d.orgData)
					}, d.orgData, _this5._highlights) ? 0.25 : 0.0;
				});

				this._container.selectAll('.sceneGroup').select('.characters').selectAll('.' + _ordervis2.default.mark).style('fill-opacity', function (d) {
					return _this5._isHighlighted({
						type: CHILDDATA,
						data: d.orgData
					}, d.parentOrgDdata, _this5._highlights) ? 1.0 : 0.15;
				});

				return this;
			}
		}, {
			key: 'isHighlighted',
			value: function isHighlighted(_) {
				if (!arguments.length) return this._isHighlighted;
				this._isHighlighted = _;
				return this;
			}
		}, {
			key: 'tipFormat',
			value: function tipFormat(_) {
				if (!arguments.length) return this._tipFormat;
				this._tipFormat = _;
				return this;
			}
		}, {
			key: 'xtitle',
			value: function xtitle(_) {
				if (!arguments.length) return this._xtitle;
				this._xtitle = _;
				return this;
			}
		}, {
			key: 'ytitle',
			value: function ytitle(_) {
				if (!arguments.length) return this._ytitle;
				this._ytitle = _;
				return this;
			}
		}, {
			key: 'children',
			value: function children(_) {
				if (!arguments.length) return this._children;
				this._children = _;
				return this;
			}
		}, {
			key: 'childCategory',
			value: function childCategory(_) {
				if (!arguments.length) return this._childCategory;
				this._childCategory = _;
				return this;
			}
		}, {
			key: 'categoryScale',
			value: function categoryScale(_) {
				if (!arguments.length) return this._cs;
				this._cs = _;
				return this;
			}
		}, {
			key: 'meta1ColorScale',
			value: function meta1ColorScale(_) {
				if (!arguments.length) return this._csm1;
				this._csm1 = _;
				return this;
			}
		}, {
			key: 'meta2ColorScale',
			value: function meta2ColorScale(_) {
				if (!arguments.length) return this._csm2;
				this._csm2 = _;
				return this;
			}
		}, {
			key: 'metadata1',
			value: function metadata1(_) {
				if (!arguments.length) return this._metadata1;
				this._metadata1 = _;
				return this;
			}
		}, {
			key: 'metadata2',
			value: function metadata2(_) {
				if (!arguments.length) return this._metadata2;
				this._metadata2 = _;
				return this;
			}
		}, {
			key: 'orderX',
			value: function orderX(_) {
				if (!arguments.length) return this._orderX;
				this._orderX = _;
				return this;
			}
		}, {
			key: 'orderY',
			value: function orderY(_) {
				if (!arguments.length) return this._orderY;
				this._orderY = _;
				return this;
			}
		}, {
			key: 'width',
			value: function width(_) {
				if (!arguments.length) return this._width;
				this._width = _;
				return this;
			}
		}, {
			key: 'height',
			value: function height(_) {
				if (!arguments.length) return this._height;
				this._height = _;
				return this;
			}
		}, {
			key: 'size',
			value: function size(_) {
				if (!arguments.length) return this._size;
				this._size = _;
				return this;
			}
		}, {
			key: 'container',
			value: function container(selector) {
				if (!arguments.length) return this._container;
				this._container = d3.select(selector);
				return this;
			}
		}, {
			key: 'on',
			value: function on(name, callback) {
				this._listners[name] = callback;
				return this;
			}
		}]);
		return OrderVis;
	}();

	exports.default = OrderVis;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(12), __esModule: true };

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(57);
	__webpack_require__(61);
	__webpack_require__(78);
	__webpack_require__(81);
	__webpack_require__(83);
	module.exports = __webpack_require__(4).Map;


/***/ }),
/* 13 */
/***/ (function(module, exports) {

	

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at = __webpack_require__(15)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(18)(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(16);
	var defined = __webpack_require__(17);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(defined(that));
	    var i = toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};


/***/ }),
/* 16 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	module.exports = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY = __webpack_require__(19);
	var $export = __webpack_require__(20);
	var redefine = __webpack_require__(34);
	var hide = __webpack_require__(24);
	var has = __webpack_require__(35);
	var Iterators = __webpack_require__(36);
	var $iterCreate = __webpack_require__(37);
	var setToStringTag = __webpack_require__(53);
	var getPrototypeOf = __webpack_require__(55);
	var ITERATOR = __webpack_require__(54)('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = (!BUGGY && $native) || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

	module.exports = true;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(21);
	var core = __webpack_require__(4);
	var ctx = __webpack_require__(22);
	var hide = __webpack_require__(24);
	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var IS_WRAP = type & $export.W;
	  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
	  var expProto = exports[PROTOTYPE];
	  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
	  var key, own, out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && key in exports) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function (C) {
	      var F = function (a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0: return new C();
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	module.exports = $export;


/***/ }),
/* 21 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(23);
	module.exports = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

	module.exports = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(25);
	var createDesc = __webpack_require__(33);
	module.exports = __webpack_require__(29) ? function (object, key, value) {
	  return dP.f(object, key, createDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(26);
	var IE8_DOM_DEFINE = __webpack_require__(28);
	var toPrimitive = __webpack_require__(32);
	var dP = Object.defineProperty;

	exports.f = __webpack_require__(29) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);
	module.exports = function (it) {
	  if (!isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	module.exports = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(29) && !__webpack_require__(30)(function () {
	  return Object.defineProperty(__webpack_require__(31)('div'), 'a', { get: function () { return 7; } }).a != 7;
	});


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(30)(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});


/***/ }),
/* 30 */
/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);
	var document = __webpack_require__(21).document;
	// typeof document.createElement is 'object' in old IE
	var is = isObject(document) && isObject(document.createElement);
	module.exports = function (it) {
	  return is ? document.createElement(it) : {};
	};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(27);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function (it, S) {
	  if (!isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

	module.exports = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(24);


/***/ }),
/* 35 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

	module.exports = {};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var create = __webpack_require__(38);
	var descriptor = __webpack_require__(33);
	var setToStringTag = __webpack_require__(53);
	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(24)(IteratorPrototype, __webpack_require__(54)('iterator'), function () { return this; });

	module.exports = function (Constructor, NAME, next) {
	  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
	  setToStringTag(Constructor, NAME + ' Iterator');
	};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject = __webpack_require__(26);
	var dPs = __webpack_require__(39);
	var enumBugKeys = __webpack_require__(51);
	var IE_PROTO = __webpack_require__(48)('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(31)('iframe');
	  var i = enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(52).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(25);
	var anObject = __webpack_require__(26);
	var getKeys = __webpack_require__(40);

	module.exports = __webpack_require__(29) ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = getKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys = __webpack_require__(41);
	var enumBugKeys = __webpack_require__(51);

	module.exports = Object.keys || function keys(O) {
	  return $keys(O, enumBugKeys);
	};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	var has = __webpack_require__(35);
	var toIObject = __webpack_require__(42);
	var arrayIndexOf = __webpack_require__(45)(false);
	var IE_PROTO = __webpack_require__(48)('IE_PROTO');

	module.exports = function (object, names) {
	  var O = toIObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(43);
	var defined = __webpack_require__(17);
	module.exports = function (it) {
	  return IObject(defined(it));
	};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(44);
	// eslint-disable-next-line no-prototype-builtins
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};


/***/ }),
/* 44 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = function (it) {
	  return toString.call(it).slice(8, -1);
	};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(42);
	var toLength = __webpack_require__(46);
	var toAbsoluteIndex = __webpack_require__(47);
	module.exports = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(16);
	var min = Math.min;
	module.exports = function (it) {
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(16);
	var max = Math.max;
	var min = Math.min;
	module.exports = function (index, length) {
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(49)('keys');
	var uid = __webpack_require__(50);
	module.exports = function (key) {
	  return shared[key] || (shared[key] = uid(key));
	};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(21);
	var SHARED = '__core-js_shared__';
	var store = global[SHARED] || (global[SHARED] = {});
	module.exports = function (key) {
	  return store[key] || (store[key] = {});
	};


/***/ }),
/* 50 */
/***/ (function(module, exports) {

	var id = 0;
	var px = Math.random();
	module.exports = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};


/***/ }),
/* 51 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	var document = __webpack_require__(21).document;
	module.exports = document && document.documentElement;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(25).f;
	var has = __webpack_require__(35);
	var TAG = __webpack_require__(54)('toStringTag');

	module.exports = function (it, tag, stat) {
	  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	var store = __webpack_require__(49)('wks');
	var uid = __webpack_require__(50);
	var Symbol = __webpack_require__(21).Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has = __webpack_require__(35);
	var toObject = __webpack_require__(56);
	var IE_PROTO = __webpack_require__(48)('IE_PROTO');
	var ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO)) return O[IE_PROTO];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(17);
	module.exports = function (it) {
	  return Object(defined(it));
	};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(58);
	var global = __webpack_require__(21);
	var hide = __webpack_require__(24);
	var Iterators = __webpack_require__(36);
	var TO_STRING_TAG = __webpack_require__(54)('toStringTag');

	var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
	  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
	  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
	  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
	  'TextTrackList,TouchList').split(',');

	for (var i = 0; i < DOMIterables.length; i++) {
	  var NAME = DOMIterables[i];
	  var Collection = global[NAME];
	  var proto = Collection && Collection.prototype;
	  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(59);
	var step = __webpack_require__(60);
	var Iterators = __webpack_require__(36);
	var toIObject = __webpack_require__(42);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(18)(Array, 'Array', function (iterated, kind) {
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return step(1);
	  }
	  if (kind == 'keys') return step(0, index);
	  if (kind == 'values') return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');


/***/ }),
/* 59 */
/***/ (function(module, exports) {

	module.exports = function () { /* empty */ };


/***/ }),
/* 60 */
/***/ (function(module, exports) {

	module.exports = function (done, value) {
	  return { value: value, done: !!done };
	};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(62);
	var validate = __webpack_require__(72);
	var MAP = 'Map';

	// 23.1 Map Objects
	module.exports = __webpack_require__(73)(MAP, function (get) {
	  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key) {
	    var entry = strong.getEntry(validate(this, MAP), key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value) {
	    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
	  }
	}, strong, true);


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var dP = __webpack_require__(25).f;
	var create = __webpack_require__(38);
	var redefineAll = __webpack_require__(63);
	var ctx = __webpack_require__(22);
	var anInstance = __webpack_require__(64);
	var forOf = __webpack_require__(65);
	var $iterDefine = __webpack_require__(18);
	var step = __webpack_require__(60);
	var setSpecies = __webpack_require__(70);
	var DESCRIPTORS = __webpack_require__(29);
	var fastKey = __webpack_require__(71).fastKey;
	var validate = __webpack_require__(72);
	var SIZE = DESCRIPTORS ? '_s' : 'size';

	var getEntry = function (that, key) {
	  // fast case
	  var index = fastKey(key);
	  var entry;
	  if (index !== 'F') return that._i[index];
	  // frozen object case
	  for (entry = that._f; entry; entry = entry.n) {
	    if (entry.k == key) return entry;
	  }
	};

	module.exports = {
	  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, NAME, '_i');
	      that._t = NAME;         // collection type
	      that._i = create(null); // index
	      that._f = undefined;    // first entry
	      that._l = undefined;    // last entry
	      that[SIZE] = 0;         // size
	      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
	          entry.r = true;
	          if (entry.p) entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = validate(this, NAME);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.n;
	          var prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if (prev) prev.n = next;
	          if (next) next.p = prev;
	          if (that._f == entry) that._f = next;
	          if (that._l == entry) that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        validate(this, NAME);
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.n : this._f) {
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while (entry && entry.r) entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(validate(this, NAME), key);
	      }
	    });
	    if (DESCRIPTORS) dP(C.prototype, 'size', {
	      get: function () {
	        return validate(this, NAME)[SIZE];
	      }
	    });
	    return C;
	  },
	  def: function (that, key, value) {
	    var entry = getEntry(that, key);
	    var prev, index;
	    // change existing entry
	    if (entry) {
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if (!that._f) that._f = entry;
	      if (prev) prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if (index !== 'F') that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function (C, NAME, IS_MAP) {
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function (iterated, kind) {
	      this._t = validate(iterated, NAME); // target
	      this._k = kind;                     // kind
	      this._l = undefined;                // previous
	    }, function () {
	      var that = this;
	      var kind = that._k;
	      var entry = that._l;
	      // revert to the last existing entry
	      while (entry && entry.r) entry = entry.p;
	      // get next entry
	      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if (kind == 'keys') return step(0, entry.k);
	      if (kind == 'values') return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(24);
	module.exports = function (target, src, safe) {
	  for (var key in src) {
	    if (safe && target[key]) target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};


/***/ }),
/* 64 */
/***/ (function(module, exports) {

	module.exports = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(22);
	var call = __webpack_require__(66);
	var isArrayIter = __webpack_require__(67);
	var anObject = __webpack_require__(26);
	var toLength = __webpack_require__(46);
	var getIterFn = __webpack_require__(68);
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
	  var f = ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = call(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(26);
	module.exports = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) anObject(ret.call(iterator));
	    throw e;
	  }
	};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators = __webpack_require__(36);
	var ITERATOR = __webpack_require__(54)('iterator');
	var ArrayProto = Array.prototype;

	module.exports = function (it) {
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	var classof = __webpack_require__(69);
	var ITERATOR = __webpack_require__(54)('iterator');
	var Iterators = __webpack_require__(36);
	module.exports = __webpack_require__(4).getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(44);
	var TAG = __webpack_require__(54)('toStringTag');
	// ES3 wrong here
	var ARG = cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	module.exports = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global = __webpack_require__(21);
	var core = __webpack_require__(4);
	var dP = __webpack_require__(25);
	var DESCRIPTORS = __webpack_require__(29);
	var SPECIES = __webpack_require__(54)('species');

	module.exports = function (KEY) {
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	var META = __webpack_require__(50)('meta');
	var isObject = __webpack_require__(27);
	var has = __webpack_require__(35);
	var setDesc = __webpack_require__(25).f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !__webpack_require__(30)(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);
	module.exports = function (it, TYPE) {
	  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
	  return it;
	};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global = __webpack_require__(21);
	var $export = __webpack_require__(20);
	var meta = __webpack_require__(71);
	var fails = __webpack_require__(30);
	var hide = __webpack_require__(24);
	var redefineAll = __webpack_require__(63);
	var forOf = __webpack_require__(65);
	var anInstance = __webpack_require__(64);
	var isObject = __webpack_require__(27);
	var setToStringTag = __webpack_require__(53);
	var dP = __webpack_require__(25).f;
	var each = __webpack_require__(74)(0);
	var DESCRIPTORS = __webpack_require__(29);

	module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
	  var Base = global[NAME];
	  var C = Base;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var proto = C && C.prototype;
	  var O = {};
	  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
	    new C().entries().next();
	  }))) {
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	    meta.NEED = true;
	  } else {
	    C = wrapper(function (target, iterable) {
	      anInstance(target, C, NAME, '_c');
	      target._c = new Base();
	      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
	        anInstance(this, C, KEY);
	        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return IS_ADDER ? this : result;
	      });
	    });
	    IS_WEAK || dP(C.prototype, 'size', {
	      get: function () {
	        return this._c.size;
	      }
	    });
	  }

	  setToStringTag(C, NAME);

	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F, O);

	  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

	  return C;
	};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx = __webpack_require__(22);
	var IObject = __webpack_require__(43);
	var toObject = __webpack_require__(56);
	var toLength = __webpack_require__(46);
	var asc = __webpack_require__(75);
	module.exports = function (TYPE, $create) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  var create = $create || asc;
	  return function ($this, callbackfn, that) {
	    var O = toObject($this);
	    var self = IObject(O);
	    var f = ctx(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var val, res;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      val = self[index];
	      res = f(val, index, O);
	      if (TYPE) {
	        if (IS_MAP) result[index] = res;   // map
	        else if (res) switch (TYPE) {
	          case 3: return true;             // some
	          case 5: return val;              // find
	          case 6: return index;            // findIndex
	          case 2: result.push(val);        // filter
	        } else if (IS_EVERY) return false; // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(76);

	module.exports = function (original, length) {
	  return new (speciesConstructor(original))(length);
	};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);
	var isArray = __webpack_require__(77);
	var SPECIES = __webpack_require__(54)('species');

	module.exports = function (original) {
	  var C;
	  if (isArray(original)) {
	    C = original.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(44);
	module.exports = Array.isArray || function isArray(arg) {
	  return cof(arg) == 'Array';
	};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export = __webpack_require__(20);

	$export($export.P + $export.R, 'Map', { toJSON: __webpack_require__(79)('Map') });


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = __webpack_require__(69);
	var from = __webpack_require__(80);
	module.exports = function (NAME) {
	  return function toJSON() {
	    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
	    return from(this);
	  };
	};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	var forOf = __webpack_require__(65);

	module.exports = function (iter, ITERATOR) {
	  var result = [];
	  forOf(iter, false, result.push, result, ITERATOR);
	  return result;
	};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
	__webpack_require__(82)('Map');


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// https://tc39.github.io/proposal-setmap-offrom/
	var $export = __webpack_require__(20);

	module.exports = function (COLLECTION) {
	  $export($export.S, COLLECTION, { of: function of() {
	    var length = arguments.length;
	    var A = new Array(length);
	    while (length--) A[length] = arguments[length];
	    return new this(A);
	  } });
	};


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
	__webpack_require__(84)('Map');


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// https://tc39.github.io/proposal-setmap-offrom/
	var $export = __webpack_require__(20);
	var aFunction = __webpack_require__(23);
	var ctx = __webpack_require__(22);
	var forOf = __webpack_require__(65);

	module.exports = function (COLLECTION) {
	  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
	    var mapFn = arguments[1];
	    var mapping, A, n, cb;
	    aFunction(this);
	    mapping = mapFn !== undefined;
	    if (mapping) aFunction(mapFn);
	    if (source == undefined) return new this();
	    A = [];
	    if (mapping) {
	      n = 0;
	      cb = ctx(mapFn, arguments[2], 2);
	      forOf(source, false, function (nextItem) {
	        A.push(cb(nextItem, n++));
	      });
	    } else {
	      forOf(source, false, A.push, A);
	    }
	    return new this(A);
	  } });
	};


/***/ }),
/* 85 */
/***/ (function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _defineProperty = __webpack_require__(87);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(88), __esModule: true };

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(89);
	var $Object = __webpack_require__(4).Object;
	module.exports = function defineProperty(it, key, desc) {
	  return $Object.defineProperty(it, key, desc);
	};


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(20);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(29), 'Object', { defineProperty: __webpack_require__(25).f });


/***/ }),
/* 90 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"axisLegend":"_1b3cuP7LNAsR6XBRTac_0K","bgText":"_1Xpizt2CEh84qU_oOEzPQl","bgLine":"i4leO_X-URscnKgEoxf88","axisText":"_3ucRJbVgqKYQLnFJsYODEL","axisDomain":"_28PF_cu2_lRaYv-iUzOr3J","xaxisTickLine":"_1sYBJr8RUDTjASka0GfA--","yaxisInnerTickLine":"_2Fwuj_QqNk2z0XMY0vUzr","connectLine":"_2IZzTaZGU6LPXL5mSuUnI4","mark":"_21eY5N91CK_Vp5aZmpuE2i","shortBand":"_2YwRGO5gwd4QNkSQZBqP3g","overlay":"_1KAhK4d8KUZj22-EUmZlg7","overlayHorz":"_2AGjZ9IUj5qqiPkNpKc0RH","longBand":"_3nnIKHeMolxxEabR2AtCuU","highlight":"_2CTnpNASa8-VdGWxMBqKWp","d3Tip":"_3YLzKnDYKKECeo9F4czfMc"};

/***/ }),
/* 91 */,
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.CLICK_ON_LABEL = exports.ONMOUSECLICK = exports.ONMOUSEOUT = exports.ONMOUSEOVER = exports.ONZOOM = undefined;

	var _map = __webpack_require__(11);

	var _map2 = _interopRequireDefault(_map);

	var _classCallCheck2 = __webpack_require__(85);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(86);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _metavis = __webpack_require__(93);

	var _metavis2 = _interopRequireDefault(_metavis);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var ONZOOM = exports.ONZOOM = 'zoom';
	var ONMOUSEOVER = exports.ONMOUSEOVER = 'mouseover';
	var ONMOUSEOUT = exports.ONMOUSEOUT = 'mouseout';
	var ONMOUSECLICK = exports.ONMOUSECLICK = 'click';
	var CLICK_ON_LABEL = exports.CLICK_ON_LABEL = 'click_on_label';

	var MetaVis = function () {
	  function MetaVis(selector) {
	    (0, _classCallCheck3.default)(this, MetaVis);

	    this._container = d3.select(selector);
	    this._width = 800;
	    this._height = 14;
	    this._margin = {
	      top: 0, //60+5+15/2
	      left: 0,
	      right: 0,
	      bottom: 0
	    };
	    this._duration = 400; // animation duration
	    this._selected = false;

	    this._cs = d3.scaleOrdinal()
	    // .domain(['Negative', 'Neutral', 'Positive'])
	    // .range(['#fc8d59', '#ffffbf', '#91cf60'])
	    // .range(['#DB2828', '#767676', '#21BA45'])
	    // .unknown('#EEEEEE');
	    // let categoryScale = d3.scaleOrdinal()
	    .domain(['']).range(['#00B5AD']).unknown('#F5F5F5');
	    this._tip = d3.tip().attr('class', _metavis2.default.d3Tip).offset([0, 10]).direction('e').html(this._tipFormat);

	    this._xs = d3.scaleLinear();
	    this._zoom = d3.zoom();
	    this._listners = new _map2.default();
	  }

	  (0, _createClass3.default)(MetaVis, [{
	    key: 'draw',
	    value: function draw(data) {
	      var _this = this;

	      if (this._container.empty()) {
	        return;
	      }
	      this._container.datum(data);

	      // console.log('---------- MetaVis:', data.filter);
	      // console.log(data);
	      var scenes = data.scenes;
	      var filter = data.filter;

	      var width = this._width - this._margin.left - this._margin.right;
	      var height = this._height - this._margin.top - this._margin.bottom;

	      var xpadding = 80; //left xpadding

	      var markHeight = height - 6; //subtract stroke width top and bottom

	      // create root container
	      var svg = this._container.select('svg');
	      if (svg.empty()) {
	        // init
	        svg = this._container.append('svg');
	        svg.append('g').attr('class', 'visarea').append('defs') // clipPath for panning & zooming
	        .append('clipPath').attr('id', 'clipID' + Date.now()).append('rect').attr('x', xpadding).attr('y', 0);

	        svg.call(this._tip);
	      }
	      var g = svg.select('.visarea');

	      // update vis size
	      svg.attr('width', this._width).attr('height', this._height);
	      g.attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
	      g.select('clipPath').select('rect').attr('width', width - xpadding).attr('height', height);

	      // let tooltip = d3.select(this).select('.tooltip');
	      // if (tooltip.empty()) {
	      //   this.createTooltip(d3.select(this)); //replace with d3.tip
	      // }

	      // define scales
	      this._xs.domain([0, d3.sum(scenes, this._size)]).range([xpadding, width]);

	      var text = filter.charAt(0).toUpperCase() + filter.slice(1);
	      text = text.length > 15 ? text.slice(0, 14) + '...' : text;
	      // compute layout
	      var cursor = 0;
	      var markData = scenes.sort(function (d1, d2) {
	        return _this._order(d1) - _this._order(d2);
	      }).map(function (d) {
	        var x0 = _this._xs(cursor);
	        cursor += _this._size(d);
	        var x1 = _this._xs(cursor);
	        return {
	          label: text,
	          category: _this._category(d, filter),
	          x0: x0,
	          x1: x1,
	          order: _this._order(d)
	        };
	      });
	      // category domain may be specified by the user
	      // if (this._cs.domain().length==0){
	      //   let categories = markData.map(d => d.category);
	      //   categories = d3.set(categories.filter(c => c != null)).values()
	      //     .sort((a, b) => a.localeCompare(b));
	      //   this._cs.domain(categories);
	      // }
	      // draw name

	      var label = g.select('.' + _metavis2.default.label);
	      if (label.empty()) {
	        label = g.append('text').attr('class', _metavis2.default.label).on('mouseover', function (d, i, ns) {
	          return _this._onMouseOverLabel(d, i, ns);
	        }).on('mouseout', function (d, i, ns) {
	          return _this._onMouseOutLabel(d, i, ns);
	        }).on('click', function (d, i, ns) {
	          console.log('click');
	          _this._onMouseClickLabel(d, i, ns);
	        });
	      }
	      label.text(text);

	      // draw scenes
	      var main = g.select('.main');
	      if (main.empty()) {
	        main = g.append('g').attr('clip-path', 'url(#' + g.select('clipPath').attr('id') + ')').append('g').attr('class', 'main');
	      }

	      var marks = main.selectAll('.' + _metavis2.default.mark).data(markData);

	      marks.exit().remove();
	      marks.enter().append('rect').attr('class', _metavis2.default.mark).attr('height', markHeight).on('mouseover', function (d, i, ns) {
	        return _this._onMouseOver(d, i, ns);
	      }).on('mouseout', function (d, i, ns) {
	        return _this._onMouseOut(d, i, ns);
	      }).on('click', function (d, i, ns) {
	        return _this._onMouseClick(d, i, ns);
	      }).merge(marks).style('fill', function (d) {
	        return _this._cs(d.category);
	      }).attr('y', -markHeight).attr('x', function (d) {
	        return d.x0;
	      }).attr('width', function (d) {
	        return d.x1 - d.x0;
	      }).attr('pointer-events', 'none').transition().duration(this._duration).attr('y', 2).on('end', function () {
	        d3.select(this).attr('pointer-events', null);
	      });

	      // zoom setting
	      main.call(this._zoom); //attach zoom to the vis area

	      this._zoom.on('zoom', function () {
	        return _this._onZoom();
	      });

	      this._zoom.extent([[xpadding, 0], [width, height]]).translateExtent([[xpadding, 0], [width, height]]).scaleExtent([1, 15]);
	    }
	  }, {
	    key: '_order',
	    value: function _order(d) {
	      return d.narrative_order;
	    }
	  }, {
	    key: '_size',
	    value: function _size(d) {
	      return d.scene_metadata.size;
	    }
	  }, {
	    key: '_category',
	    value: function _category(d, filter) {
	      var filtered = d.character_metadata.filter(function (d) {
	        return d.name == filter;
	      });
	      if (filtered.length != 1) {
	        return null;
	      }
	      var sentiment = filtered[0].sentiment;
	      return sentiment == 0 ? 'Neutral' : sentiment > 0 ? 'Positive' : 'Negative';
	    }
	  }, {
	    key: '_onZoom',
	    value: function _onZoom() {
	      this._tip.hide();

	      this._container.select('.main').attr('transform', 'translate(' + d3.event.transform.x + ',0) scale(' + d3.event.transform.k + ',1)');

	      if (this._listners[ONZOOM]) {
	        this._listners[ONZOOM].call(this, d3.event.transform);
	      }
	    }
	  }, {
	    key: '_onMouseOver',
	    value: function _onMouseOver() {
	      this.highlightOn(arguments[0].order);

	      if (this._listners[ONMOUSEOVER]) {
	        this._listners[ONMOUSEOVER].apply(this, arguments);
	      }
	    }
	  }, {
	    key: '_onMouseOut',
	    value: function _onMouseOut() {
	      this.highlightOff(arguments[0].order);

	      if (this._listners[ONMOUSEOUT]) {
	        this._listners[ONMOUSEOUT].apply(this, arguments);
	      }
	    }
	  }, {
	    key: '_onMouseClick',
	    value: function _onMouseClick() {
	      if (this._listners[ONMOUSECLICK]) {
	        this._listners[ONMOUSECLICK].apply(this, arguments);
	      }
	    }
	  }, {
	    key: '_onMouseClickLabel',
	    value: function _onMouseClickLabel() {
	      console.log('_onMouseClickLabel');
	      var elem = arguments[2][arguments[1]];
	      this._selected = !this._selected;
	      console.log(d3.select(elem).text(), this._selected);
	      d3.select(elem).classed(_metavis2.default.selected, this._selected);
	      if (this._listners[CLICK_ON_LABEL]) {
	        this._listners[CLICK_ON_LABEL].apply(this, arguments);
	      }
	    }
	  }, {
	    key: '_onMouseOverLabel',
	    value: function _onMouseOverLabel() {
	      var elem = arguments[2][arguments[1]];
	      d3.select(elem).classed(_metavis2.default.selected, true);
	    }
	  }, {
	    key: '_onMouseOutLabel',
	    value: function _onMouseOutLabel() {
	      var elem = arguments[2][arguments[1]];
	      d3.select(elem).classed(_metavis2.default.selected, this._selected);
	    }
	  }, {
	    key: '_tipFormat',
	    value: function _tipFormat(d) {
	      var content = '<table>';
	      content += '<tr><td><span style="color:#FBBD08">' + d.label + '</span></td><td>&nbsp; ' + d.category + '</td></tr>';
	      content += '</table>';
	      return content;
	    }
	  }, {
	    key: 'tipFormat',
	    value: function tipFormat(_) {
	      if (!arguments.length) return this._tipFormat;
	      this._tipFormat = _;
	      return this;
	    }
	  }, {
	    key: 'selected',
	    value: function selected(_) {
	      if (!arguments.length) return this._selected;
	      this._selected = _;
	      return this;
	    }
	  }, {
	    key: 'width',
	    value: function width(_) {
	      if (!arguments.length) return this._width;
	      this._width = _;
	      return this;
	    }
	  }, {
	    key: 'height',
	    value: function height(_) {
	      if (!arguments.length) return this._height;
	      this._height = _;
	      return this;
	    }
	  }, {
	    key: 'container',
	    value: function container(selector) {
	      if (!arguments.length) return this._container;
	      this._container = d3.select(selector);
	      return this;
	    }
	  }, {
	    key: 'size',
	    value: function size(_) {
	      if (!arguments.length) return this._size;
	      this._size = _;
	      return this;
	    }
	  }, {
	    key: 'order',
	    value: function order(_) {
	      if (!arguments.length) return this._order;
	      this._order = _;
	      return this;
	    }
	  }, {
	    key: 'category',
	    value: function category(_) {
	      if (!arguments.length) return this._category;
	      this._category = _;
	      return this;
	    }
	  }, {
	    key: 'categoryScale',
	    value: function categoryScale(_) {
	      if (!arguments.length) return this._cs;
	      this._cs = _;
	      return this;
	    }
	  }, {
	    key: 'transform',
	    value: function transform(op, param) {
	      var _this2 = this;

	      // does not call callback
	      this._tip.hide();

	      this._zoom.on('zoom', null);
	      //update zoom state
	      var zoomContainer = this._container.select('.main');
	      this._container.select('.main').call(this._zoom[op], param);
	      // update vis
	      var transform = d3.zoomTransform(zoomContainer.node());
	      this._container.select('.main').attr('transform', 'translate(' + transform.x + ',0) scale(' + transform.k + ',1)');
	      this._zoom.on('zoom', function () {
	        return _this2._onZoom();
	      });
	      return this;
	    }
	  }, {
	    key: 'highlightOn',
	    value: function highlightOn(order) {
	      var _this3 = this;

	      this._container.selectAll('.' + _metavis2.default.mark).filter(function (d) {
	        return d.order == order;
	      }).raise().style('stroke-width', '2px').style('stroke', function (d) {
	        return d.category != null ? '#546E7A' : '#CFD8DC';
	      }).each(function (d, i, ns) {
	        if (d.category != null) {
	          _this3._tip.show(d, ns[i]);
	          // this._container.select('.' + css.label)
	          //   .style('fill', '#FBBD08');
	        }
	      });
	    }
	  }, {
	    key: 'highlightOff',
	    value: function highlightOff(order) {
	      var _this4 = this;

	      this._container.selectAll('.' + _metavis2.default.mark).filter(function (d) {
	        return d.order == order;
	      }).style('stroke-width', '0px').each(function (d, i, ns) {
	        if (d.category != null) {
	          _this4._tip.hide(d, ns[i]);
	          // this._container.select('.' + css.label)
	          //   .style('fill', '#000000');
	        }
	      });
	    }
	  }, {
	    key: 'on',
	    value: function on(name, callback) {
	      this._listners[name] = callback;
	      return this;
	    }
	  }]);
	  return MetaVis;
	}();

	exports.default = MetaVis;

/***/ }),
/* 93 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"label":"_1UFkymOOkMXf33AceCigGF","mark":"_1R3OLvxw31QHKeIxt_zlYI","selected":"_1-wJXbxJHTTzxYuCU0OVAu","d3Tip":"_1noI6v708QQpwFDhux5j69"};

/***/ }),
/* 94 */,
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _getIterator2 = __webpack_require__(96);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _classCallCheck2 = __webpack_require__(85);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(86);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _constants = __webpack_require__(99);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Helper = function () {
	  function Helper() {
	    (0, _classCallCheck3.default)(this, Helper);
	  }

	  (0, _createClass3.default)(Helper, null, [{
	    key: 'calcTemporalNonlinearity',
	    value: function calcTemporalNonlinearity(scenes) {
	      var maxOrder = scenes.length - 1;
	      var diffSum = scenes.map(function (d) {
	        return Math.abs(d.narrative_order - d.story_order);
	      }).reduce(function (acc, cur) {
	        return acc + cur;
	      }, 0);
	      var maxDiff = scenes.map(function (d) {
	        return Math.abs(maxOrder - d.story_order);
	      }).reduce(function (acc, cur) {
	        return acc + cur;
	      }, 0);
	      // console.log('nonlinearity:', diffSum/maxDiff);
	      return diffSum / maxDiff;
	    }
	  }, {
	    key: 'inferGender',
	    value: function inferGender(cast, characters) {
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        var _loop = function _loop() {
	          var character = _step.value;

	          var person = cast.filter(function (x) {
	            return x.character.toLowerCase().includes(character.name.toLowerCase());
	          });
	          if (person.length > 0) {
	            character.actor = person[0].name;
	            if (person[0].gender == 2) {
	              character.gender = 'Male';
	            } else if (person[0].gender == 1) {
	              character.gender = 'Female';
	            } else {
	              character.gender = 'Unknown';
	            }
	            character.img_url = person[0].img_url;
	          } else {
	            character.gender = 'Unknown';
	          }
	        };

	        for (var _iterator = (0, _getIterator3.default)(characters), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          _loop();
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'getCharData',
	    value: function getCharData(scriptinfo, options) {
	      // ranking characters and choose top ones, and put the rest into one line
	      var chardata = scriptinfo.characters.sort(function (a, b) {
	        return b.overall_verbosity - a.overall_verbosity;
	      }).slice(0, options.numChars).map(function (d) {
	        return { filter: d.name, type: 'characters', scenes: scriptinfo.scenes };
	      }); //descending
	      // let restChars = topChars.splice(0, 10);
	      //   .map(d=>({filter:d.name, scenes:scenedata}));//descending
	      //
	      // remove characters not in the top ranking
	      var topChars = chardata.map(function (d) {
	        return d.filter;
	      });
	      scriptinfo.scenes.forEach(function (d) {
	        d.characters = d.characters.filter(function (c) {
	          return topChars.includes(c);
	        }).sort(function (a, b) {
	          return topChars.indexOf(a) - topChars.indexOf(b);
	        });
	      });
	      return chardata;
	    }
	  }, {
	    key: 'getSceneMetadata',
	    value: function getSceneMetadata(scriptinfo, type, top) {
	      //TODO: improve loc resolution
	      // get unique locations
	      var aggregates = Helper.resolveNames(scriptinfo, type, top);
	      return aggregates.map(function (d) {
	        return { filter: d.key, type: type, scenes: scriptinfo.scenes };
	      });
	    }
	    // static getTimeData(scriptinfo, options){
	    //   let aggregates = Helper.resolveNames(scriptinfo, 'time', options.numTimes);
	    //   return aggregates.map(d=>({filter:d.key, type:'time', scenes:scriptinfo.scenes}));
	    // }
	    // static getIntExtData(scriptinfo, options){
	    //   let aggregates = Helper.resolveNames(scriptinfo, 'setting', options.numIntExts);
	    //   return aggregates.map(d=>({filter:d.key, type:'setting', scenes:scriptinfo.scenes}));
	    // }

	  }, {
	    key: 'getScriptData',
	    value: function getScriptData(scriptinfo, ordering) {
	      var charMap = scriptinfo.characters.reduce(function (acc, cur) {
	        acc[cur.name] = cur;
	        return acc;
	      }, {});
	      var scenes = scriptinfo.scenes;
	      var ordered = null;
	      if (ordering == _constants.STORY) {
	        // console.log('story_order');
	        ordered = scenes.sort(function (a, b) {
	          return a.story_order - b.story_order;
	        });
	      } else {
	        // console.log('narrative_order');
	        ordered = scenes.sort(function (a, b) {
	          return a.narrative_order - b.narrative_order;
	        });
	      }

	      var script = [];
	      // group by scene
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        var _loop2 = function _loop2() {
	          var scene = _step2.value;

	          // collect all segments in the scene
	          var segments = [];
	          scene.actions.concat(scene.conversations).sort(function (a, b) {
	            return a.order > b.order;
	          }).forEach(function (item) {
	            if (item.character == undefined) {
	              segments.push({
	                tag: _constants.ACTION,
	                content: item.content
	              });
	            } else {
	              segments.push({
	                tag: _constants.CHARACTER_NAME,
	                content: item.character,
	                imgUrl: charMap[item.character].img_url
	              });
	              item.dialogue.forEach(function (d) {
	                segments.push({ tag: d.type, content: d.content });
	              });
	            }
	          });
	          script.push({
	            heading: scene.heading,
	            so: scene.story_order,
	            no: scene.narrative_order,
	            segments: segments
	          });
	        };

	        for (var _iterator2 = (0, _getIterator3.default)(ordered), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          _loop2();
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }

	      return script;
	    }
	  }, {
	    key: 'resolveNames',
	    value: function resolveNames(scriptinfo, type, top) {
	      var scenes = scriptinfo.scenes;
	      // let names = d3.set(scenes, d=>d.scene_metadata[type]);
	      // resolve similar location names
	      // let resMap = d3.map();
	      // names.each(l1=>{
	      //   let s = l1;
	      //   names.each(l2=>{
	      //     if (l1.includes(l2)){
	      //       s = s==null?l2:(s.length>l2.length? l2:s);
	      //     }
	      //   });
	      //   resMap.set(l1, s);
	      // });
	      // // set new name
	      // scenes.map(s=>{
	      //   s.scene_metadata[type] = resMap.get(s.scene_metadata[type]);
	      // });
	      // rank locations

	      // scenes.forEach(d=>{
	      // 	if (d.scene_metadata[type]!=null){
	      // 			d.scene_metadata[type] = d.scene_metadata[type].replace(/ *\([^)]*\) */g, '');
	      // 	}
	      // });
	      var aggregates = d3.nest().key(function (d) {
	        return d.scene_metadata[type];
	      }).rollup(function (v) {
	        return d3.sum(v, function (d) {
	          return d.scene_metadata.size;
	        });
	      }).entries(scenes);
	      aggregates = aggregates.filter(function (d) {
	        return d.key != 'null';
	      });

	      aggregates.sort(function (a, b) {
	        return b.value - a.value;
	      });

	      aggregates = aggregates.slice(0, top);
	      // console.log(aggregates);
	      var topItems = aggregates.map(function (d) {
	        return d.key;
	      });
	      scenes.map(function (s) {
	        if (topItems.includes(s.scene_metadata[type]) == false) {
	          s.scene_metadata[type] = null;
	        }
	      });
	      return aggregates;
	    }
	  }, {
	    key: 'resolveCharacterInfo',
	    value: function resolveCharacterInfo(cast, characters, releaseDate) {
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        var _loop3 = function _loop3() {
	          var character = _step3.value;

	          var person = cast.filter(function (x) {
	            return x.character.toLowerCase().includes(character.name.toLowerCase());
	          });
	          if (person.length > 0) {
	            character.actor = person[0].name;
	            if (person[0].gender == 2) {
	              character.gender = 'Male';
	            } else if (person[0].gender == 1) {
	              character.gender = 'Female';
	            } else {
	              character.gender = 'Unknown';
	            }
	            var birthDate = new Date(person[0].birthdate);
	            character.age = releaseDate.getFullYear() - birthDate.getFullYear();
	            character.credit_order = person[0].credit_order;
	            character.imdb_id = person[0].imdb_id;
	            character.img_url = person[0].img_url;
	          } else {
	            character.actor = null;
	            character.gender = null;
	            character.age = null;
	            character.credit_order = null;
	            character.img_url = 'http://style.anu.edu.au/_anu/4/images/placeholders/person.png';
	          }
	        };

	        for (var _iterator3 = (0, _getIterator3.default)(characters), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          _loop3();
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }
	    }
	  }]);
	  return Helper;
	}();

	exports.default = Helper;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(97), __esModule: true };

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(57);
	__webpack_require__(14);
	module.exports = __webpack_require__(98);


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(26);
	var get = __webpack_require__(68);
	module.exports = __webpack_require__(4).getIterator = function (it) {
	  var iterFn = get(it);
	  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};


/***/ }),
/* 99 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var SCENE_HEADING = exports.SCENE_HEADING = 'Scene Heading';
	var ACTION = exports.ACTION = 'Action';
	var CHARACTER_NAME = exports.CHARACTER_NAME = 'Character Name';
	var DIALOGUE = exports.DIALOGUE = 'Dialogue';
	// export const TRANSITION = 'Transition';
	var PARENTHETICAL = exports.PARENTHETICAL = 'Parenthetical';
	var IGNORE = exports.IGNORE = 'Ignore';

	var STORY = exports.STORY = 1;
	var NARRATIVE = exports.NARRATIVE = 2;

	var SHOW_OVERLAPPED = exports.SHOW_OVERLAPPED = 1;
	var SHOW_ALL = exports.SHOW_ALL = 2;

	var COLOR_GENDER = exports.COLOR_GENDER = 1;
	var COLOR_SENTIMENT = exports.COLOR_SENTIMENT = 2;
	var COLOR_CHARACTERS = exports.COLOR_CHARACTERS = 3;

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _view = __webpack_require__(101);

	var _view2 = _interopRequireDefault(_view);

	var _ordering = __webpack_require__(102);

	var _ordering2 = _interopRequireDefault(_ordering);

	var _tagging = __webpack_require__(129);

	var _tagging2 = _interopRequireDefault(_tagging);

	var _metadata = __webpack_require__(133);

	var _metadata2 = _interopRequireDefault(_metadata);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var name = 'prep';
	var ctrlname = name + 'Controller';
	var _module = angular.module(name, [_tagging2.default, _metadata2.default, _ordering2.default]).config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider.state(name, {
			url: '/' + name,
			template: _view2.default,
			controller: ctrlname
		});
		$urlRouterProvider.when('/prep', '/prep/tagging');
	}).controller(ctrlname, function ($scope, $log, $location, $state) {
		$scope.name = ctrlname;
		$log.debug('controller: ' + ctrlname);
		$log.debug($location.path());
		if ($location.path() === '/prep/tagging') {
			$scope.mode = 'Tagging';
		} else if ($location.path() === '/prep/metadata') {
			$scope.mode = 'Metadata';
		} else if ($location.path() === '/prep/ordering') {
			$scope.mode = 'Ordering';
		} else {
			$state.go('prep.tagging');
		}

		$scope.titles = [];
		$scope.showLoader = true;
		$scope.selected = null;
		$('#select-movie.dropdown').dropdown({
			onChange: function onChange(id, title) {
				$scope.selected = { id: id, title: title };
				$scope.$broadcast('movieChanged', $scope.selected);
			}
		});
		fetch('/titles').then(function (response) {
			response.json().then(function (data) {
				$log.debug(data);
				$scope.showLoader = false;
				$scope.titles = data.titles;
				$scope.$apply();
				if ($scope.titles.length > 0) {
					$log.debug('default: ' + $scope.titles[0]._id);
					$('#select-movie.dropdown').dropdown('refresh');
					$('#select-movie.dropdown').dropdown('set selected', $scope.titles[0]._id);
				}
			});
		}).catch(function (err) {
			$log.debug(err);
		});
	});
	exports.default = _module.name;

/***/ }),
/* 101 */
/***/ (function(module, exports) {

	module.exports = "<!-- <h2 class=\"ui header\" ng-cloak>{{selectedMovie}}</h2> -->\n\n<div class=\"ui container\">\n  <div class=\"ui inverted dimmer\" ng-class=\"{active: showLoader}\">\n    <div class=\"ui small text loader\">Loading</div>\n  </div>\n  <div class=\"ui secondary blue menu\" style=\"margin-bottom:0px;\">\n    <div class=\"item\" style=\"padding-bottom:5px;\">\n      <div id=\"select-movie\" class=\"ui inline dropdown\" style=\"margin-top:10px;\">\n        <h2 class=\"ui header text\"></h2>\n        <i class=\"dropdown icon\"></i>\n        <div class=\"menu\">\n          <div class=\"item\" data-value=\"{{t._id}}\" ng-repeat=\"t in titles\">{{t.title}}</div>\n        </div>\n      </div>\n    </div>\n    <a class=\"item\" ng-class=\"{active: mode=='Tagging'}\"\n      ng-click=\"mode='Tagging'\" ui-sref=\"prep.tagging\">Tagging</a>\n    <a class=\"item\" ng-class=\"{active: mode=='Metadata'}\"\n      ng-click=\"mode='Metadata'\" ui-sref=\"prep.metadata\">Metadata</a>\n    <a class=\"item\" ng-class=\"{active: mode=='Ordering'}\"\n      ng-click=\"mode='Ordering'\" ui-sref=\"prep.ordering\">Ordering</a>\n  </div>\n  <div class=\"ui divider\" style=\"margin-top:0px;\"></div>\n  <div ui-view></div>\n</div>\n";

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _set = __webpack_require__(103);

	var _set2 = _interopRequireDefault(_set);

	var _getIterator2 = __webpack_require__(96);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _promise = __webpack_require__(109);

	var _promise2 = _interopRequireDefault(_promise);

	var _view = __webpack_require__(122);

	var _view2 = _interopRequireDefault(_view);

	var _style = __webpack_require__(123);

	var _style2 = _interopRequireDefault(_style);

	var _orderVis = __webpack_require__(125);

	var _orderVis2 = _interopRequireDefault(_orderVis);

	var _constants = __webpack_require__(128);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// import angular from 'angular';
	var name = 'ordering';
	var parentState = 'prep';
	var state = parentState + '.' + name;
	var ctrlname = name + 'Controller';
	var _module = angular.module(name, []).config(function ($stateProvider) {
		$stateProvider.state(state, {
			url: '/' + name,
			template: _view2.default,
			controller: ctrlname
		});
	}).filter('numberFixedLen', function () {
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
	}).directive('onFinishRender', function ($timeout) {
		return {
			restrict: 'A',
			link: function link(scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						scope.$emit(attr.onFinishRender);
					});
				}
			}
		};
	}).controller(ctrlname, function ($scope, $log, $timeout) {
		$scope.name = ctrlname;
		$scope.numLen = 3;
		$scope.script = null;
		$scope.scenes = [];
		$scope.orderVis = new _orderVis2.default();
		var visContainer = d3.select('#orderVis');

		$scope.sortableOptions = {
			update: function update(e, ui) {
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
				ghostClass: _style2.default.sortableGhost,
				onEnd: function onEnd(e) {
					$log.debug('from : ' + e.oldIndex + ' to: ' + e.newIndex);
					// update story orders
					var scene = $scope.scenes[e.oldIndex].heading;
					var newOrders = [];
					newOrders.push({
						id: $scope.script.id,
						segID: scene.segID,
						storyOrder: e.newIndex,
						prevStoryOrder: scene.storyOrder
					});
					var delta = e.newIndex > e.oldIndex ? -1 : 1;
					var i = e.newIndex;
					while (i != e.oldIndex) {
						var _scene = $scope.scenes[i].heading;
						i += delta;
						newOrders.push({
							id: $scope.script.id,
							segID: _scene.segID,
							storyOrder: i,
							prevStoryOrder: _scene.storyOrder
						});
					}
					$log.debug('newOrders:');
					$log.debug(newOrders);
					// update server
					_promise2.default.all(newOrders.map(function (d) {
						var data = new FormData();
						data.append('id', d.id);
						data.append('segID', d.segID);
						data.append('storyOrder', d.storyOrder);
						return fetch('/update_segment', {
							method: 'POST',
							body: data
						});
					})).then(function (responses) {
						var filtered = responses.filter(function (res) {
							return res.json().matched_count === 0;
						});
						if (filtered.length > 0) {
							$log.error('Error in updateStoryOrders: json.matched_count==0');
						} else {
							newOrders.map(function (d) {
								$log.debug('prev: ' + d.prevStoryOrder + 'next: ' + d.storyOrder);
								$scope.scenes[d.prevStoryOrder].heading.storyOrder = d.storyOrder;
							});
							$scope.scenes.sort(function (a, b) {
								return a.heading.storyOrder - b.heading.storyOrder;
							});
							updateVis($scope.scenes);
						}
					});
				}
			});
		});
		$scope.getClass = function (tag) {
			// console.log(tag)
			switch (tag) {
				case _constants.SCENE_HEADING:
					return _style2.default.sceneHeading;
				case _constants.ACTION:
					return _style2.default.action;
				case _constants.CHARACTER_NAME:
					return _style2.default.characterName;
				case _constants.DIALOGUE:
					return _style2.default.dialogue;
				case _constants.PARENTHETICAL:
					return _style2.default.parenthetical;
				case _constants.IGNORE:
					return _style2.default.ignore;
				default:
					return '';
			}
		};

		function movieChanged(event, data) {
			$scope.showLoader = true;
			$timeout(function () {
				$scope.$apply();
			});
			fetch('/script?id=' + data.id).then(function (res) {
				return res.json();
			}).then(function (script) {
				$scope.script = script;
				// group by scenes
				$scope.scenes = groupByScene(script.segments);
				$scope.numLen = $scope.scenes.length.toString().length;
				updateVis($scope.scenes);

				$scope.showLoader = false;
				$scope.$apply();
			}).catch(function (err) {
				$log.debug(err);
			});
		}

		function groupByScene(segments) {
			$log.debug('parsing segments into scenes');

			// sort segments by their original order
			segments.sort(function (a, b) {
				return a.segID - b.segID;
			});
			// filter non-scene information (transition or parenthetical)

			// extract scene headings
			var oldHeadings = segments.filter(function (x) {
				return x.storyOrder && x.tag === _constants.SCENE_HEADING;
			});
			var newHeadings = segments.filter(function (x) {
				return !x.storyOrder && x.tag === _constants.SCENE_HEADING;
			});
			var allHeadings = segments.filter(function (x) {
				return x.tag === _constants.SCENE_HEADING;
			});
			$log.debug('oldHeadings:');
			$log.debug(oldHeadings);
			$log.debug('newHeadings:');
			$log.debug(newHeadings);

			// assign show order (or narrative)
			allHeadings.forEach(function (x, i) {
				x.showOrder = i;
			});

			// assign story order for the first time
			if (oldHeadings.length === 0 && newHeadings.length !== 0) {
				newHeadings.forEach(function (x, i) {
					x.storyOrder = i;
				}); // same as presentation order

				// story order was previously assigned to some heading (mixed)
			} else if (oldHeadings.length !== 0 && newHeadings.length !== 0) {
				var existingOrders = oldHeadings.map(function (x) {
					return x.storyOrder;
				});
				var storyOrder = 0;
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = (0, _getIterator3.default)(newHeadings), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var heading = _step.value;

						while (existingOrders.includes(storyOrder)) {
							storyOrder += 1;
						}
						heading.storyOrder = storyOrder;
						storyOrder += 1;
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
			// no changes in order
			// else if (oldHeadings.length !== 0 && newHeadings.length === 0) {
			// // impossible condition
			// } else if (oldHeadings.length === 0 && newHeadings.length === 0) {
			// }

			// cluster into scenes
			var scenes = [];
			var scene = null;
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(segments), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var segment = _step2.value;

					if (segment.tag === _constants.SCENE_HEADING) {
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
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			$log.debug('script constructed:');

			scenes.sort(function (a, b) {
				return a.heading.storyOrder - b.heading.storyOrder;
			});

			return scenes;
		}

		function updateVis(scenes) {
			// derive data
			var data = [];
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)(scenes), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var scene = _step3.value;

					data.push({
						showOrder: scene.heading.showOrder,
						storyOrder: scene.heading.storyOrder,
						dialogueSize: scene.segments.reduce(function (sum, seg) {
							return sum + (seg.tag === _constants.DIALOGUE ? seg.content.length : 0);
						}, 0),
						charSize: new _set2.default(scene.segments.filter(function (seg) {
							return seg.tag === _constants.CHARACTER_NAME;
						}).map(function (seg) {
							return seg.content;
						})).size
					});
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			$log.debug('data:');
			$log.debug(data);
			$scope.orderVis.update(visContainer, data);
		}
	});
	exports.default = _module.name;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(104), __esModule: true };

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(57);
	__webpack_require__(105);
	__webpack_require__(106);
	__webpack_require__(107);
	__webpack_require__(108);
	module.exports = __webpack_require__(4).Set;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(62);
	var validate = __webpack_require__(72);
	var SET = 'Set';

	// 23.2 Set Objects
	module.exports = __webpack_require__(73)(SET, function (get) {
	  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function add(value) {
	    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
	  }
	}, strong);


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export = __webpack_require__(20);

	$export($export.P + $export.R, 'Set', { toJSON: __webpack_require__(79)('Set') });


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
	__webpack_require__(82)('Set');


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
	__webpack_require__(84)('Set');


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(110), __esModule: true };

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(57);
	__webpack_require__(111);
	__webpack_require__(120);
	__webpack_require__(121);
	module.exports = __webpack_require__(4).Promise;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY = __webpack_require__(19);
	var global = __webpack_require__(21);
	var ctx = __webpack_require__(22);
	var classof = __webpack_require__(69);
	var $export = __webpack_require__(20);
	var isObject = __webpack_require__(27);
	var aFunction = __webpack_require__(23);
	var anInstance = __webpack_require__(64);
	var forOf = __webpack_require__(65);
	var speciesConstructor = __webpack_require__(112);
	var task = __webpack_require__(113).set;
	var microtask = __webpack_require__(115)();
	var newPromiseCapabilityModule = __webpack_require__(116);
	var perform = __webpack_require__(117);
	var promiseResolve = __webpack_require__(118);
	var PROMISE = 'Promise';
	var TypeError = global.TypeError;
	var process = global.process;
	var $Promise = global[PROMISE];
	var isNode = classof(process) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[__webpack_require__(54)('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value);
	            if (domain) domain.exit();
	          }
	          if (result === reaction.promise) {
	            reject(TypeError('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = perform(function () {
	        if (isNode) {
	          process.emit('unhandledRejection', value, promise);
	        } else if (handler = global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  return promise._h !== 1 && (promise._a || promise._c).length === 0;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(global, function () {
	    var handler;
	    if (isNode) {
	      process.emit('rejectionHandled', promise);
	    } else if (handler = global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(63)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject = ctx($reject, promise, 1);
	  };
	  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
	__webpack_require__(53)($Promise, PROMISE);
	__webpack_require__(70)(PROMISE);
	Wrapper = __webpack_require__(4)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(119)(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject = __webpack_require__(26);
	var aFunction = __webpack_require__(23);
	var SPECIES = __webpack_require__(54)('species');
	module.exports = function (O, D) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(22);
	var invoke = __webpack_require__(114);
	var html = __webpack_require__(52);
	var cel = __webpack_require__(31);
	var global = __webpack_require__(21);
	var process = global.process;
	var setTask = global.setImmediate;
	var clearTask = global.clearImmediate;
	var MessageChannel = global.MessageChannel;
	var Dispatch = global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (__webpack_require__(44)(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
	    defer = function (id) {
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in cel('script')) {
	    defer = function (id) {
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set: setTask,
	  clear: clearTask
	};


/***/ }),
/* 114 */
/***/ (function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(21);
	var macrotask = __webpack_require__(113).set;
	var Observer = global.MutationObserver || global.WebKitMutationObserver;
	var process = global.process;
	var Promise = global.Promise;
	var isNode = __webpack_require__(44)(process) == 'process';

	module.exports = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
	  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise && Promise.resolve) {
	    var promise = Promise.resolve();
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// 25.4.1.5 NewPromiseCapability(C)
	var aFunction = __webpack_require__(23);

	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject = aFunction(reject);
	}

	module.exports.f = function (C) {
	  return new PromiseCapability(C);
	};


/***/ }),
/* 117 */
/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(26);
	var isObject = __webpack_require__(27);
	var newPromiseCapability = __webpack_require__(116);

	module.exports = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR = __webpack_require__(54)('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(riter, function () { throw 2; });
	} catch (e) { /* empty */ }

	module.exports = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-promise-finally
	'use strict';
	var $export = __webpack_require__(20);
	var core = __webpack_require__(4);
	var global = __webpack_require__(21);
	var speciesConstructor = __webpack_require__(112);
	var promiseResolve = __webpack_require__(118);

	$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
	  var C = speciesConstructor(this, core.Promise || global.Promise);
	  var isFunction = typeof onFinally == 'function';
	  return this.then(
	    isFunction ? function (x) {
	      return promiseResolve(C, onFinally()).then(function () { return x; });
	    } : onFinally,
	    isFunction ? function (e) {
	      return promiseResolve(C, onFinally()).then(function () { throw e; });
	    } : onFinally
	  );
	} });


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/proposal-promise-try
	var $export = __webpack_require__(20);
	var newPromiseCapability = __webpack_require__(116);
	var perform = __webpack_require__(117);

	$export($export.S, 'Promise', { 'try': function (callbackfn) {
	  var promiseCapability = newPromiseCapability.f(this);
	  var result = perform(callbackfn);
	  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
	  return promiseCapability.promise;
	} });


/***/ }),
/* 122 */
/***/ (function(module, exports) {

	module.exports = "<div class=\"ui inverted dimmer\" ng-class=\"{active: showLoader}\">\n  <div class=\"ui small text loader\">Loading</div>\n</div>\n<div class=\"ui grid\">\n  <div class=\"row\">\n    <div class=\"three wide column\">\n      <div id=\"orderVis\"></div>\n    </div>\n    <div id=\"orderedList\" class=\"thirteen wide column\">\n      <div\n        class=\"ui scene accordion\" ng-repeat=\"scene in scenes\"\n        on-finish-render=\"ngRepeatFinished\"\n        >\n        <div class=\"title\" style=\"padding-bottom:0px;\">\n          <strong>{{scene.heading.content}}</strong>\n        </div>\n        <div class=\"content\" style=\"padding:5px;\">\n          <div ng-class=\"getClass(segment.tag)\"\n            ng-repeat=\"segment in scene.segments\">\n            {{segment.content}}\n          </div>\n        </div>\n      </div>\n\n    </div>\n  </div>\n</div>\n";

/***/ }),
/* 123 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"sceneHeading":"K0R7QlHS0OrI_5AL2xhH-","title":"_2KSkbn6OxvWOjzakbbaujG","action":"_3Mxqrb9Pky0Pcmz7A7UNKl","others":"_3ZxjXP2lj5Y8MRV8mRMsYV","dialogue":"_9iny3J3gwdGNZ39JAgTWb","parenthetical":"G2cf2CxN6gq7lIm7Z-jhP","characterName":"_3A2g3ecegFL9Ttyw0b7rB8","ignore":"_2NxHK1fWzejR-lsRsyj174","sortableGhost":"_2o1HXkxPzZo9DbqWlQPTaF"};

/***/ }),
/* 124 */,
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _classCallCheck2 = __webpack_require__(85);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(86);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _orderVis = __webpack_require__(126);

	var _orderVis2 = _interopRequireDefault(_orderVis);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var OrderVis = function () {
		function OrderVis() {
			(0, _classCallCheck3.default)(this, OrderVis);

			// default configuration
			this.width = 200;
			this.height = 0; // calculated programmatically
			this.margin = {
				top: 15,
				left: 15,
				right: 5,
				bottom: 5
			};
			this.radius = 8;
			this.xpadding = 130;
			this.ypadding = 26;
			this.arcInnerRadius = this.radius;
			this.arcOuterRadius = this.radius + 4;
			this.data = null;
			this.svg = null;
			console.log(_orderVis2.default);
			this.tip = d3.tip().attr('class', _orderVis2.default.d3Tip + ' ' + _orderVis2.default.n).offset([-10, 0]).html(function (d) {
				var content = '<table>';
				content += '<tr><td><span style="color:#E03997">Narrative Order</span></td><td>&nbsp; ' + d.showOrder + '</td></tr>';
				content += '<tr><td><span style="color:#00B5AD">Story Order</span></td><td>&nbsp; ' + d.storyOrder + '</td></tr>';
				content += '<tr><td><span style="color:#F2711C">Dialogue Size</span></td><td>&nbsp; ' + d.dialogueSize + '</td></tr>';
				content += '<tr><td><span style="color:#DB2828">Character Size</span></td><td>&nbsp; ' + d.charSize + '</td></tr>';
				content += '</table>';
				return content;
			});
		}
		// data format
		// - data.showOrders
		// - data.storyOrders
		// - data.dialogueSize
		// - data.charSize


		(0, _createClass3.default)(OrderVis, [{
			key: 'update',
			value: function update(selection, data) {
				console.log('updating orderVis');
				var chart = this;
				if (!data) return;
				chart.data = data; // save data;
				// const width = chart.width - chart.margin.left - chart.margin.right;
				var height = data.length * chart.ypadding;
				chart.height = height + chart.margin.top + chart.margin.bottom;
				// const height = chart.height - chart.margin.top - chart.margin.bottom;
				//  Select the svg element
				var svg = selection.selectAll('svg').data([data]);
				//  Enter SVG
				var svgEnter = svg.enter().append('svg');
				var gEnter = svgEnter.append('g');
				// gEnter.append('g').attr('class', 'guides');
				// gEnter.append('g').attr('class', 'labels');

				var marks = gEnter.append('g').attr('class', 'marks');
				marks.append('g').attr('class', 'connectLines');
				marks.append('g').attr('class', 'showCircles');
				marks.append('g').attr('class', 'storyCircles');
				marks.append('g').attr('class', 'dialogueArcs');
				marks.append('g').attr('class', 'characterArcs');

				if (svg.empty()) {
					svg = svgEnter;
					svg.call(chart.tip);
				}
				chart.svg = svg;
				// Update SVG and its dimensions
				svg.attr('width', chart.width).attr('height', chart.height);
				// Container group
				svg.select('g').attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

				//* * circles, labels
				[{
					group: svg.select('.showCircles'),
					x: chart.radius,
					r: chart.radius,
					key: function key(d) {
						return d.showOrder;
					},
					// y: ys1,
					color: '#E03997'
				}, {
					group: svg.select('.storyCircles'),
					x: chart.xpadding,
					r: chart.radius,
					key: function key(d) {
						return d.storyOrder;
					},
					// y: ys2,
					color: '#00B5AD'
				}].forEach(function (param) {
					// console.log("existing scene elements")
					// console.log(marks.select('.showCircles'));
					var circles = param.group.selectAll('.circle').data(chart.data, param.key);

					circles.exit().remove();

					circles.enter().append('svg:circle').attr('class', 'circle').attr('cx', param.x).attr('cy', function (d) {
						return param.key(d) * chart.ypadding;
					}).attr('fill', param.color).attr('r', 0).on('mouseover', function (d, i) {
						chart.onMouseOverCircle(d, i, this);
					}).on('mouseout', function (d, i) {
						chart.onMouseOutCircle(d, i, this);
					}).transition().duration(500).attr('r', param.r);

					circles.transition().duration(500).attr('cx', param.x).attr('cy', function (d) {
						return param.key(d) * chart.ypadding;
					});
					//
					// const texts = param.group.selectAll('.label')
					// 	.data(chart.data, param.key);
					//
					// texts.exit().remove();
					//
					// texts.enter().append('svg:text')
					// 	.attr('class', 'label')
					// 	.attr('text-anchor', 'middle')
					// 	.attr('dominant-baseline', 'central')
					// 	.attr('font-size', '9px')
					// 	.attr('fill', 'white')
					// 	.style('pointer-events', 'none')
					// 	.attr('font-family', 'sans-serif')
					// 	.attr('x', param.x)
					// 	.attr('y', (d) => param.key(d) * chart.ypadding)
					// 	.text(d => param.key(d));
					//
					// texts.attr('x', param.x)
					// 	.attr('y', (d) => param.key(d) * chart.ypadding)
					// 	.text(d => param.key(d));
				});
				//* * characters
				[{
					group: svg.select('.characterArcs'),
					key: function key(d) {
						return d.charSize;
					},
					x: chart.xpadding,
					arcInnerRadius: chart.arcInnerRadius,
					arcOuterRadius: chart.arcOuterRadius,
					dir: -1, // right
					color: '#DB2828'
				}, {
					group: svg.select('.dialogueArcs'),
					key: function key(d) {
						return d.dialogueSize;
					},
					x: chart.xpadding,
					arcInnerRadius: chart.arcInnerRadius,
					arcOuterRadius: chart.arcOuterRadius,
					dir: 1, // left
					color: '#F2711C'
				}].forEach(function (param) {
					var arc = d3.arc().innerRadius(param.arcInnerRadius).outerRadius(param.arcOuterRadius).startAngle(0);
					var as = d3.scaleLinear().range([0, param.dir * Math.PI]).domain(d3.extent(chart.data, param.key)); // scale swapped
					var arcs = param.group.selectAll('.arc').data(data);

					arcs.exit().remove();

					arcs.enter().append('path').attr('class', 'arc').attr('transform', function (d) {
						return 'translate(' + param.x + ',' + d.storyOrder * chart.ypadding + ')';
					}).attr('fill', param.color).attr('d', function () {
						return arc.endAngle(0)();
					}).transition().duration(500).attrTween('d', function (d) {
						var interp = d3.interpolate(0, as(param.key(d)));
						return function (t) {
							return arc.endAngle(interp(t))();
						}; // interpolate end angle at t
					});

					arcs.transition().duration(500).attr('transform', function (d) {
						return 'translate(' + param.x + ',' + d.storyOrder * chart.ypadding + ')';
					});
				});

				//* * connect lines
				var lines = svg.select('.connectLines').selectAll('.connect-line').data(data, function (d) {
					return d.showOrder + ',' + d.storyOrder;
				});
				lines.exit().remove();

				var pathFunc = function pathFunc(d) {
					var x1 = chart.radius;
					var x2 = chart.xpadding;
					var y1 = d.showOrder * chart.ypadding;
					var y2 = d.storyOrder * chart.ypadding;
					var path = d3.path();
					path.moveTo(x1, y1);
					path.bezierCurveTo(x1 + chart.xpadding / (2 * chart.radius) * chart.radius, y1, x2 - chart.xpadding / (2 * chart.radius) * chart.radius, y2, x2, y2);
					// console.log(path.toString())
					return path.toString();
				};
				// console.log(lines)
				lines.enter().append('path').attr('class', 'connect-line').transition().duration(500).attr('d', pathFunc).attr('stroke-width', 2).attr('stroke', '#00B5AD').attr('opacity', 0.5).attr('fill', 'none');

				lines.transition().duration(500).attr('d', pathFunc);
			}
		}, {
			key: 'onMouseOverCircle',
			value: function onMouseOverCircle(d, i, elem) {
				this.highlightOn(d);
				this.tip.show.call(elem, d, i);
			}
		}, {
			key: 'onMouseOutCircle',
			value: function onMouseOutCircle(d, i, elem) {
				this.highlightOff(d);
				this.tip.hide.call(elem, d, i);
			}
		}, {
			key: 'highlightOn',
			value: function highlightOn(d) {
				// console.log(this.svg.empty());
				this.svg.select('.storyCircles').selectAll('.circle').filter(function (v) {
					return v.storyOrder == d.storyOrder;
				}).transition().duration(100).attr('fill', '#FBBD08');
				this.svg.select('.showCircles').selectAll('.circle').filter(function (v) {
					return v.showOrder == d.showOrder;
				}).transition().duration(100).attr('fill', '#FBBD08');
				this.svg.select('.connectLines').selectAll('.connect-line').filter(function (v) {
					return v.showOrder == d.showOrder;
				}).transition().duration(100).attr('stroke', '#FBBD08');
			}
		}, {
			key: 'highlightOff',
			value: function highlightOff(d) {
				this.svg.select('.storyCircles').selectAll('.circle').filter(function (v) {
					return v.storyOrder == d.storyOrder;
				}).transition().duration(100).attr('fill', '#00B5AD');
				this.svg.select('.showCircles').selectAll('.circle').filter(function (v) {
					return v.showOrder == d.showOrder;
				}).transition().duration(100).attr('fill', '#E03997');
				this.svg.select('.connectLines').selectAll('.connect-line').filter(function (v) {
					return v.showOrder == d.showOrder;
				}).transition().duration(100).attr('stroke', '#00B5AD');
			}
		}]);
		return OrderVis;
	}();

	exports.default = OrderVis;

/***/ }),
/* 126 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"d3Tip":"_1pmmpVO3Qq_P2aGlhN8ikh","n":"_33My5YyIw6FE9A93OiVALI"};

/***/ }),
/* 127 */,
/* 128 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var SCENE_HEADING = exports.SCENE_HEADING = 'Scene Heading';
	var ACTION = exports.ACTION = 'Action';
	var CHARACTER_NAME = exports.CHARACTER_NAME = 'Character Name';
	var DIALOGUE = exports.DIALOGUE = 'Dialogue';
	// export const TRANSITION = 'Transition';
	var PARENTHETICAL = exports.PARENTHETICAL = 'Parenthetical';
	var IGNORE = exports.IGNORE = 'Ignore';

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.view = exports.ctrlname = undefined;

	var _view = __webpack_require__(130);

	var _view2 = _interopRequireDefault(_view);

	var _style = __webpack_require__(131);

	var _style2 = _interopRequireDefault(_style);

	var _constants = __webpack_require__(128);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var name = 'tagging'; // import angular from 'angular';

	var parentState = 'prep';
	var state = parentState + '.' + name;
	var ctrlname = name + 'Controller';
	// module
	var _module = angular.module(name, []).config(function ($stateProvider) {
		$stateProvider.state(state, {
			url: '/' + name,
			template: _view2.default,
			controller: ctrlname
		});
	}).controller(ctrlname, function ($scope, $log, $timeout) {
		var PAGESIZE = 300;
		$scope.name = ctrlname;
		$scope.segments = [];
		$scope.script = null;
		$scope.styles = _style2.default;
		$scope.tags = [_constants.SCENE_HEADING, _constants.ACTION, _constants.CHARACTER_NAME, _constants.DIALOGUE, _constants.PARENTHETICAL, _constants.IGNORE];
		$log.debug('controler: ' + ctrlname);

		if ($scope.$parent.selected) {
			movieChanged(null, $scope.$parent.selected);
		}
		$scope.$on('movieChanged', movieChanged);
		$scope.getClass = function (tag) {
			// console.log(tag)
			switch (tag) {
				case _constants.SCENE_HEADING:
					return _style2.default.sceneHeading;
				case _constants.ACTION:
					return _style2.default.action;
				case _constants.CHARACTER_NAME:
					return _style2.default.characterName;
				case _constants.DIALOGUE:
					return _style2.default.dialogue;
				case _constants.PARENTHETICAL:
					return _style2.default.parenthetical;
				case _constants.IGNORE:
					return _style2.default.ignore;
				default:
					return '';
			}
		};

		function movieChanged(event, data) {
			$scope.showLoader = true;
			$timeout(function () {
				$scope.$apply();
			});
			fetch('/script?id=' + data.id).then(function (res) {
				return res.json();
			}).then(function (script) {
				$log.debug('script:');
				$log.debug(script);
				$scope.segments = [];
				$scope.script = script;
				$scope.loadMore();
				$scope.showLoader = false;
				$scope.$apply();
			}).catch(function (err) {
				$log.debug(err);
			});
		}

		$scope.loadMore = function () {
			var start = $scope.segments.length;
			if (!$scope.script || start > $scope.script.segments.length) {
				return;
			}
			var newSegments = $scope.script.segments.slice(start, start + PAGESIZE);
			$scope.segments = $scope.segments.concat(newSegments);
			$log.debug('loading...' + $scope.segments.length + ' itmes');
			// $scope.showLoader = true;
		};
		$scope.updateContent = function (segID, newSegContent) {
			$log.debug('updateContent');
			$log.debug(segID + ':' + newSegContent);
			var data = new FormData();
			data.append('id', $scope.script.id);
			data.append('segID', segID);
			data.append('content', newSegContent);
			fetch('/update_segment', {
				method: 'POST',
				body: data
			}).then(function (response) {
				return response.json();
			}).then(function (json) {
				if (json.matched_count === 0) {
					//  TODO: better handling of failure
					$log.log('Error in updateContent: json.matched_count==0');
				}
			});
		};
		$scope.updateTag = function (segID, newSegTag) {
			$log.debug('updateTag');
			var data = new FormData();
			data.append('id', $scope.script.id);
			data.append('segID', segID);
			data.append('tag', newSegTag);
			fetch('/update_segment', {
				method: 'POST',
				body: data
			}).then(function (response) {
				return response.json();
			}).then(function (json) {
				if (json.matched_count === 0) {
					//  TODO: better handling of failure
					$log.log('Error in updateTag: json.matched_count==0');
				}
			});
		};
	});
	exports.ctrlname = ctrlname;
	exports.view = _view2.default;
	exports.default = _module.name;

/***/ }),
/* 130 */
/***/ (function(module, exports) {

	module.exports = "<div class=\"ui inverted dimmer\" ng-class=\"{active: showLoader}\">\n  <div class=\"ui small text loader\">Loading</div>\n</div>\n<div class=\"ui grid\">\n  <div class=\"column\">\n    <div class=\"ui list\" infinite-scroll=\"loadMore()\" infinite-scroll-distance=\"15\">\n      <div ng-class=\"['item', styles.segment]\" ng-repeat=\"segment in segments track by $index\"\n        >\n        <div class=\"right floated content\">\n          <select name=\"tag\" ng-class=\"styles.tagDropdown\" ng-model=\"segment.tag\" ng-change=\"updateTag(segment.segID, segment.tag)\">\n            <option ng-value=\"tag\" ng-repeat=\"tag in tags\">{{tag}}</option>\n          </select>\n        </div>\n        <span style=\"float:left;\">{{$index}}. </span>\n        <div class=\"ui transparent fluid input\" ng-class=\"getClass(segment.tag)\">\n          <input ng-class=\"getClass(segment.tag)\"\n            type=\"text\" ng-model=\"segment.content\" ng-value=\"segment.content\"\n            ng-change=\"updateContent(segment.segID, segment.content)\">\n        </div>\n        <!-- <div ng-class=\"['content', getClass(segment.tag)]\">\n          {{segment.content}}\n        </div> -->\n\n\n      </div>\n    </div>\n  </div>\n</div>\n";

/***/ }),
/* 131 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"segment":"_1e3eWaQGl476x7I1DNEpLQ","tagDropdown":"_3HKcpXXxCF-BXvZw71M323","sceneHeading":"_1fZQ-6jGMMJisEeGRfDgPl","title":"_3v5yB3B_3Xw2P4eB8mCqIO","action":"ASKAiGyt3tCB8XcIt9NAC","others":"yoQyTWHkp-F91NGLRDl_C","dialogue":"_3zGDpPvlTGcwXNNycdvJcR","parenthetical":"_1M4hPHBGDc54TOW1SmTmTs","characterName":"F_OEny-X2ygXGMDYmMXhs","ignore":"_3c27p1l7ILc_V2y511xOH"};

/***/ }),
/* 132 */,
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.view = exports.ctrlname = undefined;

	var _getIterator2 = __webpack_require__(96);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _view = __webpack_require__(134);

	var _view2 = _interopRequireDefault(_view);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// import styles from './style.css';
	var name = 'metadata'; // import angular from 'angular';

	var parentState = 'prep';
	var state = parentState + '.' + name;
	var ctrlname = name + 'Controller';
	// module
	var _module = angular.module(name, []).config(function ($stateProvider) {
		$stateProvider.state(state, {
			url: '/' + name,
			template: _view2.default,
			controller: ctrlname
		});
	}).directive('onFinishRender', function ($timeout) {
		return {
			restrict: 'A',
			link: function link(scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						scope.$emit(attr.onFinishRender);
					});
				}
			}
		};
	}).controller(ctrlname, function ($scope, $log, $timeout) {
		$scope.name = ctrlname;
		$log.debug('controler: ' + ctrlname);
		$scope.scriptID = -1;
		if ($scope.$parent.selected) {
			movieChanged(null, $scope.$parent.selected);
		}
		$scope.$on('movieChanged', movieChanged);
		$scope.$on('ngRepeatFinished', function () {
			$('.scene.styled.accordion').accordion();
		});

		function movieChanged(event, data) {
			$scope.showLoader = true;
			$timeout(function () {
				$scope.$apply();
			});
			$scope.scriptID = data.id;
			fetch('/metadata?id=' + data.id).then(function (res) {
				return res.json();
			}).then(function (metadata) {
				$scope.script_metadata = metadata.script_metadata;
				$scope.tmdb_metadata = metadata.tmdb_metadata;
				$scope.characters = resolveCharacterInfo($scope.tmdb_metadata.cast, $scope.script_metadata.characters, new Date($scope.tmdb_metadata.release_date));
				$log.debug('metadata:');
				$log.debug(metadata);
				$scope.showLoader = false;
				$scope.$apply();
			}).catch(function (err) {
				$log.debug(err);
			});
		}
		$scope.forceUpdateMetadata = function () {
			if ($scope.scriptID == -1) {
				return;
			}
			$scope.showLoader = true;
			fetch('/metadata?id=' + $scope.scriptID + '&force=ScriptMetadata').then(function (res) {
				return res.json();
			}).then(function (metadata) {
				$scope.script_metadata = metadata.script_metadata;
				$scope.tmdb_metadata = metadata.tmdb_metadata;
				resolveCharacterInfo($scope.tmdb_metadata.cast, $scope.script_metadata.characters, new Date($scope.tmdb_metadata.release_date));
				$log.debug('metadata:');
				$log.debug(metadata);
				$scope.showLoader = false;
				$scope.$apply();
			}).catch(function (err) {
				$log.debug(err);
			});
		};
		function resolveCharacterInfo(cast, characters, releaseDate) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				var _loop = function _loop() {
					var character = _step.value;

					$log.debug(character.name);
					var person = cast.filter(function (x) {
						return x.character.toLowerCase().includes(character.name.toLowerCase());
					});
					if (person.length > 0) {
						character.actor = person[0].name;
						if (person[0].gender == 2) {
							character.gender = 'Male';
						} else if (person[0].gender == 1) {
							character.gender = 'Female';
						} else {
							character.gender = 'Unknown';
						}
						var birthDate = new Date(person[0].birthdate);
						character.age = releaseDate.getFullYear() - birthDate.getFullYear();
						character.credit_order = person[0].credit_order;
						character.imdb_id = person[0].imdb_id;
						character.img_url = person[0].img_url;
					} else {
						character.actor = null;
						character.gender = null;
						character.age = null;
						character.credit_order = null;
						character.img_url = 'http://style.anu.edu.au/_anu/4/images/placeholders/person.png';
					}
				};

				for (var _iterator = (0, _getIterator3.default)(characters), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					_loop();
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	});
	exports.ctrlname = ctrlname;
	exports.view = _view2.default;
	exports.default = _module.name;

/***/ }),
/* 134 */
/***/ (function(module, exports) {

	module.exports = "<div class=\"ui inverted dimmer\" ng-class=\"{active: showLoader}\">\n  <div class=\"ui small text loader\">Loading</div>\n</div>\n<button class=\"fluid ui teal button\" ng-click=\"forceUpdateMetadata()\">Force Update</button>\n<div class=\"ui black segment\">\n  <!-- <a class=\"ui top left attached label\">Movie Overview</a> -->\n  <div class=\"ui three column grid\"  style=\"margin-top:10px;\">\n    <div class=\"row\">\n      <div class=\"column\">\n        <h4 class=\"ui header \">\n          {{tmdb_metadata.original_title}}\n        </h4>\n        <img class=\"ui medium rounded image\" ng-src=\"{{tmdb_metadata.backdrop_path}}\">\n\n      </div>\n      <div class=\"column\">\n        <h4 class=\"ui header\">\n          Rating\n          <div class=\"sub header\">{{tmdb_metadata.vote_average}}/10</div>\n        </h4>\n\n        <h4 class=\"ui header\">\n          Tagline\n          <div class=\"sub header\">{{tmdb_metadata.tagline}}</div>\n        </h4>\n\n        <h4 class=\"ui header\">\n          Release Date\n          <div class=\"sub header\">{{tmdb_metadata.release_date}}</div>\n        </h4>\n\n        <h4 class=\"ui header\">\n          Run Time\n          <div class=\"sub header\">{{tmdb_metadata.runtime}} min</div>\n        </h4>\n        <h4 class=\"ui header\">\n          Director\n          <div class=\"sub header\">\n            <a class=\"ui image label\" style=\"margin-top:5px;\">\n              <img ng-src=\"{{tmdb_metadata.director.img_url}}\">\n              {{tmdb_metadata.director.name}}\n            </a>\n          </div>\n        </h4>\n\n      </div>\n      <div class=\"column\">\n        <h4 class=\"ui header\">\n          Genres\n          <div class=\"sub header\">\n            <div class=\"ui label\" style=\"margin-top:5px;\" ng-repeat=\"genre in tmdb_metadata.genres\">\n              {{genre}}\n            </div>\n          </div>\n        </h4>\n\n        <h4 class=\"ui header\">\n          Keywords\n          <div class=\"sub header\">\n            <div style=\"margin-top:5px;\"class=\"ui label\" ng-repeat=\"keyword in tmdb_metadata.keywords\">\n              {{keyword}}\n            </div>\n          </div>\n        </h4>\n\n        <h4 class=\"ui header\">\n          IMDB Info\n          <div class=\"sub header\">\n            <a class=\"ui label\" style=\"margin-top:5px;\" ng-href=\"https://www.imdb.com/title/{{tmdb_metadata.imdb_id}}\">\n              <i class=\"film icon\"></i>\n              Link\n            </a>\n          </div>\n        </h4>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"ui basic segment\">\n  <div class=\"ui horizontal divider\">Character Metadata</div>\n  <!-- <a class=\"ui teal ribbon label\">Characters</a> -->\n  <div class=\"ui four doubling stackable cards\"  style=\"margin-top:10px;\">\n    <div class=\"team card\" ng-repeat=\"character in script_metadata.characters\"\n      ng-class=\"{violet:character.gender=='Male', pink:character.gender=='Female'}\">\n      <div class=\"content\">\n        <img class=\"right floated mini ui image\"\n        ng-src=\"{{character.img_url}}\">\n        <div class=\"header\">\n          {{character.name}}\n        </div>\n        <div class=\"meta\">\n          {{character.actor}} {{character.age}}\n        </div>\n        <div class=\"description\">\n          <div class=\"ui aligned small divided list\">\n            <div class=\"item\">\n              <div class=\"right floated content\">\n                {{character.betweenness_centrality | number:2}}\n              </div>\n              <div class=\"content\">\n                Betweenness Centrality\n              </div>\n            </div>\n            <div class=\"item\">\n              <div class=\"right floated content\">\n                {{character.degree_centrality}}\n              </div>\n              <div class=\"content\">\n                Degree Centrality\n              </div>\n            </div>\n            <div class=\"item\">\n              <div class=\"right floated content\">\n                {{character.overall_verbosity}}\n              </div>\n              <div class=\"content\">\n                Dialogue verbosity\n              </div>\n            </div>\n            <div class=\"item\">\n              <div class=\"right floated content\">\n                {{character.overall_sentiment | number:2}}\n              </div>\n              <div class=\"content\">\n                Dialogue sentiment\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"extra content\">\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"ui basic segment\">\n  <div class=\"ui horizontal divider\">Scene Metadata</div>\n  <!-- <a class=\"ui orange ribbon label\">Scenes</a> -->\n  <div class=\"ui divided items\">\n    <div class=\"item\" ng-repeat=\"scene in script_metadata.scenes\">\n      <div class=\"content\">\n        <a class=\"header\">Scene #{{$index}}</a>\n        <div class=\"meta\">\n          <div class=\"ui pink basic label\" ng-show=\"scene.scene_metadata.setting\">{{scene.scene_metadata.setting}}</div>\n          <div class=\"ui teal basic label\" ng-show=\"scene.scene_metadata.location\">{{scene.scene_metadata.location}}</div>\n          <div class=\"ui green basic label\" ng-show=\"scene.scene_metadata.time\">{{scene.scene_metadata.time}}</div>\n          <div class=\"ui grey basic label\">\n            Sentiment\n            <div class=\"detail\">{{scene.scene_metadata.sentiment | number:2}}</div>\n          </div>\n\n        </div>\n        <div class=\"ui four doubling stackable cards\"  style=\"margin-top:10px;\">\n          <div class=\"team card\" ng-repeat=\"character in scene.character_metadata\">\n            <div class=\"content\">\n              <!-- <img class=\"right floated mini ui image\"\n              ng-src=\"{{character.img_url}}\"> -->\n              <div class=\"header\">\n                {{character.name}}\n              </div>\n              <!-- <div class=\"meta\">\n                {{character.actor}} {{character.age}}\n              </div> -->\n              <div class=\"description\">\n                <div class=\"ui aligned small divided list\">\n                  <div class=\"item\">\n                    <div class=\"right floated content\">\n                      {{character.verbosity}}\n                    </div>\n                    <div class=\"content\">\n                      Dialogue verbosity\n                    </div>\n                  </div>\n                  <div class=\"item\">\n                    <div class=\"right floated content\">\n                      {{character.sentiment | number:2}}\n                    </div>\n                    <div class=\"content\">\n                      Dialogue sentiment\n                    </div>\n                  </div>\n                </div>\n              </div>\n              <div class=\"extra content\">\n              </div>\n            </div>\n          </div>\n        </div>\n\n\n      </div>\n    </div>\n  </div>\n</div>\n\n\n\n<!--\n\n<div class=\"ui segment\">\n  <a class=\"ui red ribbon label\">Scenes</a>\n  <div class=\"ui scene styled accordion\"\n    on-finish-render=\"ngRepeatFinished\"\n    ng-repeat=\"scene in script_metadata.scenes\">\n    <div class=\"title\"  style=\"padding-bottom:0px;\">\n      <strong>{{scene.heading}}</strong>\n    </div>\n    <div class=\"content\" style=\"padding:5px;\">\n      <div>Location: {{scene.location}}</div>\n      <div>Time: {{scene.time}}</div>\n      <h5 class=\"ui header\">Characters</h5>\n      <div class=\"ui horizontal list\">\n        <div class=\"item\" ng-repeat=\"character in scene.characters\">\n          <div class=\"ui label\">\n            {{character}}\n            <div class=\"detail\">\n              ({{scene.metadata[character].verbosity }},\n              {{scene.metadata[character].sentiment | number:2 }})\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div> -->\n";

/***/ })
]);