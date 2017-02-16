angular.module('FrontTestIntegration', []).controller('FrontTestController', ['$scope', '$interval', 'FrontTestService', function($scope, $interval, FrontTestService){
	$scope.issues = [];
	FrontTestService.getGithubDetails()
		.then(function(response){
			$scope.issues = response.data;
			console.log($scope.issues);
		});
	$scope.monitorCommentsForIssue = function(issue){
		console.log(issue);
		if(!FrontTestService.timers[issue.id] || !FrontTestService.timers[issue.id].active){
			console.log('monitoring comments triggered for: ' + issue.id);
			FrontTestService.timers[issue.id] = $interval(function(){
				console.log(issue.url);
				FrontTestService.getGithubCommentsForIssue(issue.comments_url)
					.then(function(response){
						console.log(response.data);
						issue.comments = response.data.length;
						if(!issue.fetchedComments){
							issue.fetchedComments = response.data;
						} else {
							if(response.data.length > issue.fetchedComments.length){
								for (var i = issue.fetchedComments.length; i < response.data.length; i++){
									issue.fetchedComments.push(response.data[i]);
								}
							}
						}	
					});
				console.log('monitoring issue: ' + issue.id);
			}, 5000);
			FrontTestService.timers[issue.id].active = true;
			issue.monitoringEnabled = true;
		} else {
			console.log('monitoring comments cancelled for: ' + issue.id);
			$interval.cancel(FrontTestService.timers[issue.id]);
			FrontTestService.timers[issue.id].active = false;
			issue.monitoringEnabled = false;
		}
	};
}])
.service('FrontTestService', ['$http', '$q', function($http, $q){
	this.getGithubDetails = function getGithubDetails(){
		//GET /repos/:owner/:repo/issues
		var githubBaseUri = 'https://api.github.com';
		return $http.get(githubBaseUri + '/repos/macklevine/front-test-project/issues');
	};
	this.createFrontConversationForissue = function(issue){

	};
	this.createFrontMessageForComment = function(comment){

	};
	this.getGithubCommentsForIssue = function getGithubCommentsForIssue(url){
		return $http.get(url);
	};
	this.timers = {};
}]);



