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
				FrontTestService.getGithubCommentsForIssue(issue.url)
					.then(function(response){
						console.log(response.data);
						if(!issue.fetchedComments){
							issue.fetchedComments = response.data;
						}
						// if(response.data.length > issue.fetchedComments.length){
						// 	for (var i = issue.fetchedComments.)
						// }
						// issue.fetchedComments = response.data;
					});
				console.log('monitoring issue: ' + issue.id);
			}, 1000);
			FrontTestService.timers[issue.id].active = true;
			issue.monitoringEnabled = true;
		} else {
			console.log('monitoring comments cancelled for: ' + issue.id);
			$interval.cancel(FrontTestService.timers[issue.id]);
			FrontTestService.timers[issue.id].active = false;
			issue.monitoringEnabled = false;
		}
	};
	$scope.fetchComments = function(url, issue){
		if(issue.comments === 0){
			issue.noCommentsFound = true;
		}
		if(issue.commentsFetched)return;
		FrontTestService.getGithubCommentsForIssue(url)
			.then(function(response){
				issue.fetchedComments = response.data;
			});
	};
	$scope.draftMessageWithComment = function(comment){
		if(window.Front){
			Front.compose({
			    from: 'mackplevine@gmail.com',
			    to: ['mackplevine@gmail.com'],
			    // cc: ['copy@example.com'],
			    subject: 'Optional subject',
			    body: comment,
			    // tags: ['tag_alias_1', 'tag_alias_2'],
			    attachment_uids: [],
			    hide_composer: false
			});
		}
	}
}])
.service('FrontTestService', ['$http', '$q', function($http, $q){
	this.getGithubDetails = function getGithubDetails(){
		//GET /repos/:owner/:repo/issues
		var githubBaseUri = 'https://api.github.com';
		return $http.get(githubBaseUri + '/repos/macklevine/front-test-project/issues');
	};
	this.getGithubCommentsForIssue = function getGithubCommentsForIssue(url){
		return $http.get(url);
	};
	this.timers = {};
}]);