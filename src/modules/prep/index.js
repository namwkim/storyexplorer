import view from './view.html';
import ordering from './ordering';
import tagging from './tagging';
import metadata from './metadata';

let name = 'prep';
let ctrlname = name + 'Controller';
let module = angular.module(name, [tagging, metadata, ordering])
	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider.state(name, {
			url: '/' + name,
			template: view,
			controller: ctrlname
		});
		$urlRouterProvider.when('/prep', '/prep/tagging');
	})
	.controller(ctrlname, function ($scope, $log, $location, $state) {
		$scope.name = ctrlname;
		$log.debug('controller: ' + ctrlname);
		$log.debug($location.path());
		if ($location.path()==='/prep/tagging'){
			$scope.mode = 'Tagging';
		}else if ($location.path()==='/prep/metadata'){
			$scope.mode = 'Metadata';
		}else if ($location.path()==='/prep/ordering'){
			$scope.mode = 'Ordering';
		}else{
			$state.go('prep.tagging');
		}

    $scope.titles = [];
    $scope.showLoader = true;
		$scope.selected = null;
    $('#select-movie.dropdown').dropdown({
      onChange:function(id, title){
				$scope.selected = {id, title};
        $scope.$broadcast('movieChanged', $scope.selected);
      }
    });
		fetch('/titles').then(function (response) {
			response.json().then(function(data){
        $log.debug(data);
        $scope.showLoader = false;
        $scope.titles = data.titles;
        $scope.$apply();
        if ($scope.titles.length>0){
          $log.debug('default: ' + $scope.titles[0]._id);
          $('#select-movie.dropdown').dropdown('refresh');
          $('#select-movie.dropdown').dropdown('set selected', $scope.titles[0]._id);
        }
      });
		}).catch(function (err) {
			$log.debug(err);
		});
	});
export default module.name;
