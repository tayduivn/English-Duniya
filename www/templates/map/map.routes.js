(function() {
  'use strict';

  angular
    .module('zaya-map')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('map', {
        url: '/map',
        abstract: true,
        resolve: {
          lessons: ['$log','content','User', function($log,content,User) {
            $log.debug("mapRoutes OnlessonsResolve 1",User.getActiveProfileSync().data.profile.grade)

            return content.getLessonsList(User.getActiveProfileSync().data.profile.grade).then(function(result){
              $log.debug("mapRoutes OnlessonsResolve 2",result)

              return result
            })
          }],
          lessonLocked: ['$log','content','extendLesson','User', function($log, content,extendLesson,User) {
            $log.debug("mapRoutes OnlessonLockedResolve 1")

            return content.getLessonsList(User.getActiveProfileSync().data.profile.grade).then(function(lessons){
              $log.debug("mapRoutes OnlessonLockedResolve 2",lessons)

              return extendLesson.getLesson(lessons,[]).then(function(result){
                $log.debug("mapRoutes OnlessonLockedResolve 3",result)

                return result;
              });
            })
          }],
          scores: ['Rest', '$log', 'content', function(Rest, $log, content) {
            return [];
        }],
        skills : ['$log','content','User', function($log,content,User){
          $log.debug("mapRoutes OnSkillsResolve 1",User.getActiveProfileSync()._id)

          return User.skills.get(User.getActiveProfileSync()._id).then(function(response){
            $log.debug("mapRoutes OnSkillsResolve 2",response)

            return response;
          })
        }]

        },
        template: '<ion-nav-view name="state-map"></ion-nav-view>'
      })
      .state('map.navigate', {
        url: '/navigate',
        nativeTransitions: {
          "type": "fade",
          "duration": 1000,
        },
        data : {
            litmus : {
              "id": "001",
              "content_type_name": "litmus",
              "tag": "Litmus",
              "locked": false
          },
      },
      params: {"activatedLesson" : null},
        onEnter: ['$state', 'lessons', 'audio', '$ionicLoading', 'orientation','CONSTANT','$log', function($state, lessons, audio, $ionicLoading, orientation, CONSTANT, $log) {
          orientation.setPortrait();
          $ionicLoading.show({
            templateUrl: 'templates/common/common.loader.view.html',
            // duration: 3000
          });
          if (!lessons) {
            $state.go('map.unauthorised');
          }
          $log.debug("mapRoutes OnEnter done")
          // audio.play('background');
        //   if(localStorage.getItem('region')>'3409'){
        //   }
        //   else{
        //       audio.play('three_star');
        //   }
        }],
        onExit: ['audio', function(audio) {
          audio.stop('background');
          // audio.stop('demo-2');
          // audio.stop('demo-4');
        }],
        views: {
          'state-map': {
            templateUrl: CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            controller: 'mapController as mapCtrl'
          }
        }
      })
      .state('map.unauthorised', {
        url: '/unauthorised',
        views: {
          'state-map': {
            templateUrl: CONSTANT.PATH.MAP + '/map.unauthorised' + CONSTANT.VIEW,
            controller: 'mapController as mapCtrl'
          }
        }
      })
  }
})();
