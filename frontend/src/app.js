// import angular from 'angular';

import vis from 'modules/vis';
import prep from 'modules/prep';
angular.module('app', ['ui.router','infinite-scroll',

	prep,

	vis
]).
config(function ($urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {//$locationProvider,
		$urlMatcherFactoryProvider.strictMode(false);
		$locationProvider.html5Mode(true);
		$urlRouterProvider.when('/', '/vis');

	})
	.controller('appCtrl', function () {
		// $state.go('vis');
	});
