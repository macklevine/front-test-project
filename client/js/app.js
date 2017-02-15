angular.module('FrontTestIntegration', []).controller('FrontTestController', ['$scope', 'FrontTestService', function($scope, FrontTestService){
	$scope.issues = [];
	FrontTestService.getGithubDetails()
		.then(function(response){
			$scope.issues = response.data;
			console.log($scope.issues);
		});
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
		//https://github.com/easternbloc/node-stomp-client
		return $http.get(githubBaseUri + '/repos/easternbloc/node-stomp-client/issues');
	};
	this.getGithubCommentsForIssue = function getGithubCommentsForIssue(url){
		return $http.get(url);
	}
}]);