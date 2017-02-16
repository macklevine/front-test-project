angular.module('FrontTestIntegration', []).controller('FrontTestController', ['$scope', '$interval', 'FrontTestService', function($scope, $interval, FrontTestService){
	$scope.issues = [];
	Front.fetchChannels(function (channels) {
	    if (!channels) return;
	    console.log(channels);
	});
	FrontTestService.getGithubDetails()
		.then(function(response){
			$scope.issues = response.data;
			for (var i = 0; i < $scope.issues.length; i++){
				FrontTestService.createFrontConversationForIssue($scope.issues[i]);
			}
			console.log($scope.issues);
		});
	$scope.monitorCommentsForIssue = function(issue){
		//TODO: evenually replace this with github webhooks.
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
									FrontTestService.createFrontMessageForComment(issue.fetchedComments[i]);
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
	var self = this;
	this.customChannel = '';
	this.getGithubDetails = function getGithubDetails(){
		var githubBaseUri = 'https://api.github.com';
		return $http.get(githubBaseUri + '/repos/macklevine/front-test-project/issues');
	};
	this.createFrontConversationForIssue = function(issue){
		var composeMessage = function(){
			console.log(self.customChannel);
			Front.compose({
			    from: 'github integration',
			    to: [self.customChannel],
			    subject: issue.title,
			    body: issue.body,
			    attachment_uids: [],
			    hide_composer: false
			});
		};
		if(!self.customChannel){
			Front.fetchChannels(function (channels) {
				for (var i = 0; i < channels.length; i++){
					console.log(channels[i]);
					if(channels[i].type_name==='email'){
						self.customChannel = channels[i].send_as;
						composeMessage();
						issue.frontConversationCreated = true;
						break;
					}
				}
			});
		} else {
			issue.frontConversationCreated = true;
			composeMessage();
		}
	};
	this.createFrontMessageForComment = function(comment){

	};
	this.getGithubCommentsForIssue = function getGithubCommentsForIssue(url){
		return $http.get(url);
	};
	this.timers = {};
}]);



