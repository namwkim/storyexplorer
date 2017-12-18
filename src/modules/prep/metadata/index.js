// import angular from 'angular';
import view from './view.html';
// import styles from './style.css';
let name = 'metadata';
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
      $timeout(function() {
        $scope.$apply();
      });
			$scope.scriptID = data.id;
			fetch('/metadata?id=' + data.id)
				.then(res=>res.json())
        .then(metadata=>{
					$scope.script_metadata = metadata.script_metadata;
					$scope.tmdb_metadata = metadata.tmdb_metadata;
					$scope.characters = resolveCharacterInfo($scope.tmdb_metadata.cast,
							$scope.script_metadata.characters,
							new Date($scope.tmdb_metadata.release_date));
					$log.debug('metadata:');
					$log.debug(metadata);
          $scope.showLoader = false;
					$scope.$apply();
				})
				.catch(function (err) {
					$log.debug(err);
				});
		}
		$scope.forceUpdateMetadata = function(){
			if ($scope.scriptID==-1){
				return;
			}
			$scope.showLoader = true;
			fetch('/metadata?id=' + $scope.scriptID + '&force=ScriptMetadata')
				.then(res=>res.json())
        .then(metadata=>{
					$scope.script_metadata = metadata.script_metadata;
					$scope.tmdb_metadata = metadata.tmdb_metadata;
					resolveCharacterInfo($scope.tmdb_metadata.cast,
							$scope.script_metadata.characters,
							new Date($scope.tmdb_metadata.release_date));
					$log.debug('metadata:');
					$log.debug(metadata);
          $scope.showLoader = false;
					$scope.$apply();
				})
				.catch(function (err) {
					$log.debug(err);
				});
		};
		function resolveCharacterInfo(cast, characters, releaseDate){
			for (let character of characters){
				$log.debug(character.name);
				let person = cast.filter(x=>
					x.character.toLowerCase().includes(character.name.toLowerCase()));
				if (person.length>0){
					character.actor = person[0].name;
					if (person[0].gender==2){
							character.gender = 'Male';
					}else if (person[0].gender==1){
						character.gender = 'Female';
					}else{
						character.gender = 'Unknown';
					}
					let birthDate = new Date(person[0].birthdate);
					character.age = releaseDate.getFullYear()-birthDate.getFullYear();
					character.credit_order = person[0].credit_order;
					character.imdb_id = person[0].imdb_id;
					character.img_url = person[0].img_url;
				}else{
					character.actor = null;
					character.gender = null;
					character.age = null;
					character.credit_order = null;
					character.img_url = 'http://style.anu.edu.au/_anu/4/images/placeholders/person.png';
				}
			}
		}

	});
export {
	ctrlname,
	view
};
export default module.name;
