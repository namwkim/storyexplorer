import view from './view.html';
import css from './style.css';
import OrderVis from './libs/ordervis.js';
import MetaVis from './libs/metavis.js';
import Helper from './libs/helper.js';

import {
	SCENE_HEADING,
	ACTION,
	CHARACTER_NAME,
	DIALOGUE,
	PARENTHETICAL,
	IGNORE,
	STORY,
	NARRATIVE,
	COLOR_GENDER,
	COLOR_SENTIMENT,
	COLOR_CHARACTERS
	// SHOW_ALL,
	// SHOW_OVERLAPPED
}
from './libs/constants';

let name = 'vis';
let ctrlname = name + 'Controller';
let module = angular.module(name, [])
	.config(function($stateProvider) {
		$stateProvider.state(name, {
			url: '/' + name,
			template: view,
			controller: ctrlname
		});
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
	.controller(ctrlname, function($scope, $log, $window, $timeout) {
		$scope.name = ctrlname;
		$log.debug('controler:' + ctrlname);
		$scope.showLoader = true;
		$scope.scriptLoader = false;
		$scope.css = css;
		$scope.scriptinfo = null;
		$scope.movieinfo = null;
		$scope.titles = [];
		$scope.ordering =  NARRATIVE;
		$scope.showSceneLength = true;
		$scope.showRichView = true;
		$scope.charColor = COLOR_CHARACTERS;
		$scope.toggleCharacters = false;
		$scope.toggleLocations = false;
		$scope.toggleTimes = false;
		// $scope.mode = SHOW_ALL;

		$scope.options = {
			numChars : 8,
			numLocs : 4,
			numTimes: 2,
			locations: [],
			characters: [],
			times: []
		};

		// let fixedSize = true;
		let ordervis = new OrderVis('#ordervis');
		let charvisGroup = null;
		let locvisGroup = null;
		// let intextvisGroup = null;
		let timevisGroup = null;
		let allVisGroup = null;

		let scenedata = null;
		let scenedata_backup = null;
		let chardata = null;
		let locdata = null;
		// let intextdata = null;
		let timedata = null;

		let duration = 400;
		let selected = [];

		let genderMap = {};
		let prevWidth = angular.element('#visContainer').width();

		// color themes
		let default_palette = ['#00B5AD'];
		let sentiment = ['Negative', 'Neutral', 'Positive'];
		let sentiment_palette = ['#D32F2F', '#9E9E9E', '#4CAF50'];
		let gender = ['Unknown', 'Male', 'Female'];
		let gender_palette = ['#9E9E9E', '#3F51B5', '#E91E63'];

		let loc_order_palette = ['#eedaf1','#fad1df','#cfe8fc','#daddf1'];
		let loc_meta_palette = ['#CE93D8','#F48FB1','#90CAF9','#9FA8DA'];//['url(#lightstripe) #CE93D8', 'url(#crosshatch) #F48FB1', 'url(#houndstooth) #BCAAA4', 'url(#verticalstripe) #9FA8DA'];//['#CE93D8','#F48FB1','#BCAAA4','#9FA8DA'];['#CE93D8','#F48FB1','#BCAAA4','#9FA8DA'];//['url(#lightstripe) #CE93D8', 'url(#crosshatch) #F48FB1', 'url(#houndstooth) #BCAAA4', 'url(#verticalstripe) #9FA8DA'];//['#CE93D8','#F48FB1','#BCAAA4','#9FA8DA'];
		let time_palette = ['#CFD8DC','#B0BEC5','#90A4AE'];//['url(#lightstripe)', 'url(#verticalstripe)', 'url(#houndstooth)'];

		let character_palette = ['#db2828','#f2711c','#fbbd08',
			'#b5cc18','#21ba45','#00b5ad',
			'#2185d0','#6435c9'];

		preprocessing();

		let getSentiment = function(d, filter) {
			let filtered = d.character_metadata.filter(d => d.name == filter);
			if (filtered.length != 1) {
				return null;
			}
			let sentiment = filtered[0].sentiment;
			return sentiment == 0 ? 'Neutral' : (sentiment > 0 ? 'Positive' : 'Negative');
		};
		let getGender = function(d, filter) {
			let filtered = d.character_metadata.filter(d => d.name == filter);
			if (filtered.length != 1) {
				return null;
			}
			return genderMap[filter];
		};
		let getCharName = function(d, filter){
			let filtered = d.character_metadata.filter(d => d.name == filter);
			if (filtered.length != 1) {
				return null;
			}
			return filter;
		};
		let getLocName = function(d, filter){
			return d.scene_metadata.location==filter?filter:null;
		};
		let getTimeName = function(d, filter){
			return d.scene_metadata.time==filter?filter:null;
		};
		let highlightCooccur = function(target, d, highlights){
			return target.data==null?false:(highlights.length==0? true:
				highlights.every(h=>
					h.type=='characters'?d[h.type].includes(h.filter):
						d.scene_metadata[h.type]==h.filter));
		};

		let highlightAll = function(target, d, highlights){
			return target.data==null?false:(highlights.length==0? true:
				highlights.some(h=>target.data==h.filter));
		};
		// initialize semantic ui components ------------------------------
		$('.accordion').accordion({exclusive:false});

		$('.ui.embed').embed();
		$('.button').popup();
		$('.dropdown').popup();

		$('#select-scene-color').dropdown({
			onChange: ((value)=>$scope.charColorSelected(value))
		});

		// load titles TODO: include thumbnail data
		$('#select-movie').dropdown({
			onChange: movieSelected
		});

		// read movie titles
		fetch('/titles')
			.then(response => {
				response.json().then(data => {
					$scope.showLoader = false;
					$scope.titles = data.titles;
					$scope.$apply(); // update the dropdown
					// select default movie
					if ($scope.titles.length > 0) {
						$log.debug('default: ' + $scope.titles[0].title);
						$('#select-movie').dropdown('refresh');
						$('#select-movie').dropdown('set selected', $scope.titles[0]._id);
					}
				});
			}).catch(err => $log.debug(err));

		// callback functions
		$scope.$on('onScriptRendered', function () {
			// $('.script.accordion').accordion();
			Sortable.create(document.getElementById('script-view'),{
				ghostClass: css.sortableGhost,
				// dragClass: css.dragClass,
				// chosenClass: css.chosenClass,
				draggable:'.'+css.sceneView,
				handle: '.'+css.sceneHandle,
				animation:150,
				scrollSpeed:50,
				onEnd: updateStoryOrder
			});
		});

		// private functions =======================================================
		function movieSelected(id, title) {
			$log.debug('Movie Selected: ' + title);
			$scope.showLoader = true;
			$scope.$apply();
			// $timeout(()=>);//show loader
			fetch('/metadata?id=' + id)
				.then(res => res.json())
				.then(data => {
					$log.debug('data:');
					$log.debug(data);
					initialize(data);
				}).catch(err => $log.debug(err));
		}


		function initialize(data){ //called only when changing the movie

			$scope.scriptinfo = data.script_metadata;
			$scope.movieinfo = data.tmdb_metadata;

			// fix genre & release date attributes
			$scope.movieinfo.genre = $scope.movieinfo.genres.join(', ');
			$scope.movieinfo.keyword = $scope.movieinfo.keywords
				.map(d=>d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
			var months = ['January', 'February', 'March','April', 'May', 'June',
			'July','August', 'September', 'October','November', 'December'];

			let date = new Date($scope.movieinfo.release_date);
			$scope.movieinfo.release_date =  months[date.getMonth()]
				+ ' ' + date.getFullYear();

			Helper.resolveCharacterInfo($scope.movieinfo.cast,
					$scope.scriptinfo.characters,
					date);
			// infer gender & construct gender map
			Helper.inferGender($scope.movieinfo.cast, data.script_metadata.characters);

			data.script_metadata.characters.forEach(c=>genderMap[c.name]=c.gender);

			// update visualizatoin
			selected = [];
			initializeData();
			toggleRichView();
			switchCharVis();
			updateVis();
			$scope.$apply(); // update script
		}
		function initializeData(){
			// scenes
			scenedata = $scope.scriptinfo.scenes;
			scenedata_backup = JSON.parse(JSON.stringify(scenedata));
			// characters
			chardata = Helper.getCharData($scope.scriptinfo, $scope.options);
			// locations
			locdata = Helper.getSceneMetadata($scope.scriptinfo, 'location', $scope.options.numLocs);
			// interior/exterior
			// intextdata = Helper.getIntExtData($scope.scriptinfo, $scope.options);
			// times of day
			timedata = Helper.getSceneMetadata($scope.scriptinfo, 'time', $scope.options.numTimes);
			// sript
			$scope.script = Helper.getScriptData($scope.scriptinfo, $scope.ordering);
			// complexity
			$scope.complexity = Helper.calcTemporalNonlinearity($scope.scriptinfo.scenes);

		}

		function preprocessing(){
			$('#select-scene-color').dropdown('set selected', $scope.charColor);

			charvisGroup = _.range($scope.options.numChars).map(()=> new MetaVis());
			locvisGroup = _.range($scope.options.numLocs).map(()=> new MetaVis());
			// intextvisGroup = _.range($scope.options.numIntExts).map(()=> new MetaVis());
			timevisGroup = _.range($scope.options.numTimes).map(()=> new MetaVis());
			allVisGroup = charvisGroup.concat(locvisGroup)
				// .concat(intextvisGroup)
				.concat(timevisGroup)
				.concat([ordervis]);
			allVisGroup.forEach(vis=>{
				vis.width(prevWidth)
					.size($scope.showSceneLength?(d=>d.scene_metadata.size):(()=>1))
					.on('zoom', onZoom)
					.on('mouseover', onMouseOver)
					.on('mouseout', onMouseOut)
					.on('click', onMouseClick);
				if (vis.constructor.name=='MetaVis'){
					vis.on('click_on_label', onMouseClickLabel);
				}
			});
			locvisGroup.forEach(vis=>{
				vis.category((d,filter)=>d.scene_metadata.location==filter?'':null);
			});
			locvisGroup.forEach(vis=>{
				vis.category((d,filter)=>d.scene_metadata.time==filter?'':null);
			});
		}

		function updateVis(){
			$scope.showLoader = true;
			$timeout(()=>{
				updateOrderVis();
				$timeout(()=>{
					updateCharVis();
					$timeout(()=>{
						updateLocVis();
						$timeout(()=>{
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
		function updateOrderVis(){
			ordervis.draw(scenedata);
		}
		function updateCharVis(){
			// character
			let selection= d3.select('#charactervis').selectAll('.character')
				.data(chardata);

			selection = selection.enter()
				.append('div')
				.attr('class', 'character')
				.merge(selection);

			selection.each(function(d,i){
				charvisGroup[i].container(this).draw(d);
			});
		}

		function updateLocVis(){
			//location
			let selection= d3.select('#locvis').selectAll('.loc')
				.data(locdata);

			selection = selection.enter()
				.append('div')
				.attr('class', 'loc')
				.merge(selection);
			selection.each(function(d,i){
				locvisGroup[i].container(this).draw(d);
			});
		}
		function updateTimeVis(){
			//location
			let selection= d3.select('#timevis').selectAll('.time')
				.data(timedata);

			selection = selection.enter()
				.append('div')
				.attr('class', 'time')
				.merge(selection);
			selection.each(function(d,i){
				timevisGroup[i].container(this).draw(d);
			});
		}
		function updateStoryOrder(e){
			if (e.oldIndex==e.newIndex){
				return;
			}
			$log.debug('from : ' + e.oldIndex + ' to: ' + e.newIndex);
			//update story orders
			// e.oldIndex-=1;//because of loader
			// e.newIndex-=1;


			let scenes = scenedata;
			scenes.sort((a,b)=>a.story_order-b.story_order);
			const scene = scenes[e.oldIndex];
			// $log.debug(scene);
			const newOrders = [];
			newOrders.push({
				story_order: e.newIndex,
				prev_story_order: scene.story_order
			});
			const delta = e.newIndex > e.oldIndex ? -1 : 1;
			let i = e.newIndex;
			while (i != e.oldIndex) {
				const scene = scenes[i];
				i += delta;
				newOrders.push({
					story_order: i,
					prev_story_order: scene.story_order
				});
			}
			// $log.debug('newOrders:');
			// $log.debugr(newOrders);
			scenedata_backup.sort((a,b)=>a.story_order-b.story_order);
			newOrders.map(d=>{
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

			$scope.showLoader=true;


			$timeout(()=>{
				$scope.script = Helper.getScriptData($scope.scriptinfo, $scope.ordering);
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

		function onZoom(transform){
			allVisGroup.forEach(vis=>vis.transform('transform', transform));
		}
		function onMouseOver(d){
			let order = d.xo!=undefined?d.xo:d.order;
			allVisGroup.forEach(vis=>vis.highlightOn(order));
			$scope.highlightSceneInScript(order, true);
		}
		function onMouseOut(d){
			let order = d.xo!=undefined?d.xo:d.order;
			allVisGroup.forEach(vis=>vis.highlightOff(order));
			$scope.highlightSceneInScript(order, false);
			// ordervis.highlights(null);
		}
		function onMouseClick(d){
			let order = d.xo!=undefined?d.xo:d.order;
			let child  = $('#scene-'+order);
			var parent = $('#script-view');
			// console.log('order:',order);

			parent.animate({
				scrollTop: parent.scrollTop()-parent.offset().top + child.offset().top
			}, 500);


			child.click();
		}
		function onMouseClickLabel(d){
			$timeout(()=>{
				if ($scope.toggleCharacters && d.type=='characters'){
					$scope.toggleCharacters = false;
					chardata.forEach(d=>selected.indexOf(d)>-1&&
						selected.splice(selected.indexOf(d),1));
				}else if ($scope.toggleLocations && d.type=='location'){
					$scope.toggleLocations = false;
					locdata.forEach(d=>selected.indexOf(d)>-1&&
						selected.splice(selected.indexOf(d),1));
				}else if ($scope.toggleTimes && d.type=='time'){
					$scope.toggleTimes = false;
					timedata.forEach(d=>selected.indexOf(d)>-1&&
						selected.splice(selected.indexOf(d),1));
				}

				let idx = selected.indexOf(d);
				if (idx>-1){
					selected.splice(idx,1);
				}else{
					selected.push(d);
				}
				// update ordervis
				ordervis.highlights(selected);
			});
		}
		function toggleRichView(){
			if ($scope.showRichView){
				ordervis.children(d=>d.characters);
				if ($scope.charColor==COLOR_GENDER){
					ordervis.childCategory((c,p)=>getGender(p,c));
					ordervis.categoryScale()
						.domain(gender)
						.range(gender_palette);
				}else if ($scope.charColor==COLOR_SENTIMENT){
					ordervis.childCategory((c,p)=>getSentiment(p,c));
					ordervis.categoryScale()
						.domain(sentiment)
						.range(sentiment_palette);
				}else if ($scope.charColor==COLOR_CHARACTERS){
					let charNames = chardata.map(d=>d.filter);
					ordervis.childCategory(c=>c);
					ordervis.categoryScale()
						.domain(charNames)
						.range(character_palette);
				}

				let locNames = locdata.map(d=>d.filter);
				let locColorScale = d3.scaleOrdinal()
					.domain(locNames)
					.range(loc_meta_palette);
				locdata.forEach(function(d,i){
					locvisGroup[i].category(getLocName)
						.categoryScale()
						.domain([d.filter])
						.range([locColorScale(d.filter)]);
				});
				ordervis.metadata1(d=>d.scene_metadata.location);
				ordervis.meta1ColorScale()
					.domain(locNames)
					.range(loc_order_palette);

				let timeNames = timedata.map(d=>d.filter);
				let timeColorScale = d3.scaleOrdinal()
					.domain(timeNames)
					.range(time_palette);
				timedata.forEach(function(d,i){
					timevisGroup[i].category(getTimeName)
						.categoryScale()
						.domain([d.filter])
						.range([timeColorScale(d.filter)]);
				});
				ordervis.metadata2(d=>d.scene_metadata.time);
				ordervis.meta2ColorScale()
					.domain(timeNames)
					.range(time_palette);

				ordervis.isHighlighted(highlightAll);
			}else{
				ordervis.children((d,i)=>['scene-'+i]);
				ordervis.metadata1(()=>null);
				ordervis.metadata2(()=>null);
				ordervis.categoryScale()
					.domain([])
					.range(default_palette);
				ordervis.isHighlighted(highlightCooccur);

				locvisGroup.concat(locvisGroup).forEach(vis=>{
					vis.category(getLocName)
					.categoryScale()
					.domain([])
					.range(['#00B5AD']);
				});
			}

		}
		function switchCharVis(){

			if ($scope.charColor == COLOR_GENDER){
				charvisGroup.forEach(vis=>{
					vis.category(getGender)
						.categoryScale()
						.domain(gender)
						.range(gender_palette);
				});

			}else if ($scope.charColor == COLOR_SENTIMENT){
				charvisGroup.forEach(vis=>{
					vis.category(getSentiment)
						.categoryScale()
						.domain(sentiment)
						.range(sentiment_palette);
				});
			}else if ($scope.charColor == COLOR_CHARACTERS){
				let charNames = chardata.map(d=>d.filter);
				let charColorScale = d3.scaleOrdinal()
					.domain(charNames)
					.range(character_palette);
				// character
				chardata.forEach(function(d,i){
					charvisGroup[i].category(getCharName)
						.categoryScale()
						.domain([d.filter])
						.range([charColorScale(d.filter)]);
				});
			}
		}
		angular.element($window).bind('resize', function(){
			let width = angular.element('#visContainer').width();
			// console.log('prevWidth, width='+prevWidth + ', '+ width);
			if (Math.abs(prevWidth-width)>0.001){
				// console.log('Resizing vis...');
				allVisGroup.forEach(vis=>vis.width(width));
				updateVis();
				prevWidth = width;
			}
		});
		$scope.revert = function(){
			$log.debug('revert');
			$scope.ordering = $scope.ordering==STORY?NARRATIVE:STORY;
			// console.log($scope.ordering);
			let temp = ordervis.orderX();
			ordervis.orderX(ordervis.orderY());
			ordervis.orderY(temp);
			if ($scope.ordering==STORY){
				ordervis.xtitle('Story order →');
				ordervis.ytitle('← Narrative order');
				allVisGroup.filter(vis=>vis.constructor.name=='MetaVis')
					.forEach(vis=>vis.order(d=>d.story_order));
			}else{
				ordervis.xtitle('Narrative order →');
				ordervis.ytitle('← Story order');
				allVisGroup.filter(vis=>vis.constructor.name=='MetaVis')
					.forEach(vis=>vis.order(d=>d.narrative_order));
			}
			$scope.showLoader=true;

			$timeout(()=>{
				$scope.script = Helper.getScriptData($scope.scriptinfo, $scope.ordering);
				updateVis();
			});


		};
		$scope.panning = function(tx){
			$log.debug('panning');
			allVisGroup.forEach(vis=>vis.transform('translateBy', tx));
		};
		$scope.zooming = function(k){
			$log.debug('zooming');
			allVisGroup.forEach(vis=>vis.transform('scaleBy', k));
		};
		$scope.reset = function(){
			$log.debug('reset');
			allVisGroup.forEach(vis=>vis.transform('transform', d3.zoomIdentity));
		};
		$scope.highlightSceneInScript = function(order, highlight){
			// console.log('highlight-scene: '+order);
			$('#script-view').find('#scene-'+order)
				.toggleClass(css.sceneViewHover,highlight);

		};
		$scope.onOverScene = function(e, scene){
			let order = $scope.ordering==STORY?scene.so:scene.no;
			// console.log($scope.ordering, ',', order);
			// $scope.highlightSceneInScript(order, true);
			if ($scope.ordering==STORY){
				$('#script-view').find('#scene-'+order)
					.find('.'+css.sceneHandle).show();
			}
			onMouseOver.call(null, {order: order});
		};
		$scope.onOutScene = function(e, scene){
			let order = $scope.ordering==STORY?scene.so:scene.no;
			// $scope.highlightSceneInScript(order, false);
			if ($scope.ordering==STORY){
				$('#script-view').find('#scene-'+order)
					.find('.'+css.sceneHandle).hide();
			}
			onMouseOut.call(null, {order: order});
		};
		$scope.onClickScene = function(e){
			angular.element(e.currentTarget)
				.find('.'+css.sceneContent)
				.toggleClass(css.showSceneContent);

		};
		$scope.onClickSceneLength = function(){
			$scope.showSceneLength=!$scope.showSceneLength;
			if ($scope.showSceneLength){
				allVisGroup.forEach(vis=>vis.size(d=>d.scene_metadata.size));
			}else{
				allVisGroup.forEach(vis=>vis.size(()=>1));
			}
			updateVis();
		};

		$scope.onClickRichView = function(){
			$scope.showRichView=!$scope.showRichView;



			toggleRichView();
			updateOrderVis();
		};
		$scope.charColorSelected = function(value){

			if ($scope.charColor != value){
				$scope.charColor = value;
				switchCharVis();
				toggleRichView();
				if ($scope.showRichView){
					updateOrderVis();
				}
				updateCharVis();
			}
		};
		$scope.onClickToggleCharacters = function(){
			$scope.toggleCharacters = !$scope.toggleCharacters;
			if ($scope.toggleCharacters){
				chardata.forEach(d=>selected.indexOf(d)==-1 && selected.push(d));
			}else{
				chardata.forEach(d=>selected.indexOf(d)>-1 &&
					selected.splice(selected.indexOf(d),1));
			}
			ordervis.highlights(selected);
		};
		$scope.onClickToggleLocations = function(){
			$scope.toggleLocations = !$scope.toggleLocations;
			if ($scope.toggleLocations){
				locdata.forEach(d=>selected.indexOf(d)==-1 && selected.push(d));
			}else{
				locdata.forEach(d=>selected.indexOf(d)>-1 &&
					selected.splice(selected.indexOf(d),1));
			}
			ordervis.highlights(selected);
		};
		$scope.onClickToggleTimes = function(){
			$scope.toggleTimes = !$scope.toggleTimes;
			if ($scope.toggleTimes){
				timedata.forEach(d=>selected.indexOf(d)==-1 && selected.push(d));
			}else{
				timedata.forEach(d=>selected.indexOf(d)>-1 &&
					selected.splice(selected.indexOf(d),1));
			}
			ordervis.highlights(selected);
		};
		$scope.getClass = function (tag) {
			// console.log(tag)
			switch (tag) {
			case SCENE_HEADING:
				return css.sceneHeading;
			case ACTION:
				return css.action;
			case CHARACTER_NAME:
				return css.characterName;
			case DIALOGUE:
				return css.dialogue;
			case PARENTHETICAL:
			return css.parenthetical;
			case IGNORE:
				return css.ignore;
			default:
				return '';
			}
		};
	});

export default module.name;
