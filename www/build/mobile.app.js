// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function () {
  'use strict';

  angular
    .module('zaya', [
      'ionic',
      'restangular'
    ]);

})();

(function(){
    AppConfig.$inject = ["$httpProvider"];
  angular
    .module('zaya')
    .config(AppConfig)

    function AppConfig($httpProvider){
      $httpProvider.interceptors.push(["$rootScope", "$q", function ($rootScope,$q){
        return {
          request : function(config){
            if(localStorage.Authorization)
              config.headers.Authorization = 'Token '+localStorage.Authorization;
              config.headers.xsrfCookieName = 'csrftoken';
              config.headers.xsrfHeaderName = 'X-CSRFToken';
            return config;
          },
          
          response : function(response){
            if(response.status==200 && response.data.hasOwnProperty('success')){
              $rootScope.success = $rootScope.success || [];
              $rootScope.success.push(response.data.success);
              setTimeout(function(){
                $rootScope.success.pop();
              },3000)
            }

            return response;
          },
          responseError : function(rejection){
            if([400,500].indexOf(rejection.status)!=-1){
              $rootScope.error = $rootScope.error || [];
              $rootScope.error.push(rejection.data);
              setTimeout(function(){
                $rootScope.error.pop();
              },3000)
            }
            if(rejection.status==404){
              console.log(rejection);
              $rootScope.error = $rootScope.error || [];
              $rootScope.error.push({'Not Found':'Functionality not available'});
              setTimeout(function(){
                $rootScope.error.pop();
              },3000)
            }
            return $q.reject(rejection);
          }
        }
      }])
    }
})();

(function(){
  var ROOT = 'template';

  angular
    .module('zaya')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://gopal.zaya.in',
      'PATH' : {
        'AUTH' : ROOT+'/auth'
      },
      // 'CONTROLLER' : 'controller.js',
      'VIEW' : 'view.html'
    })
})();

(function() {
    'use strict';

    Rest.$inject = ["Restangular", "CONSTANT"];
    Auth.$inject = ["Restangular", "CONSTANT"];
    angular
        .module('zaya')
        .factory('Rest', Rest)
        .factory('Auth', Auth)

    function Rest(Restangular, CONSTANT) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/api/v1');
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
    function Auth(Restangular,CONSTANT){
      var rest_auth = Restangular.withConfig(function(RestangularConfigurer) {
          RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/rest-auth');
          RestangularConfigurer.setRequestSuffix('/');
          RestangularConfigurer.setDefaultHeaders({
            'Content-Type':'application/x-www-form-urlencoded',
          });
      });
      return {
        login : function(user_credentials, success, failure){
          rest_auth.all('login').post($.param(user_credentials)).then(function(response){
            localStorage.setItem('Authorization',response.key);
            success();
          },function(){
            failure();
          })
        },
        logout : function(success,failure){
          rest_auth.all('logout').post().then(function(response){
            localStorage.removeItem('Authorization');
            success();
          },function(error){
            failure();
          })
        },
        signup : function(user_credentials,success,failure){
          rest_auth.all('registration').post($.param(user_credentials),success,failure).then(function(response){
            localStorage.setItem('Authorization',response.key);
            success();
          },function(response){
            failure();
          })
        },
        reset : function (email,type,success,failure) {
          type=='password' && rest_auth.all('password').all('reset').post(email);
          type=='username' && rest_auth.all('username').all('reset').post(email);
        },
        isAuthorised : function(){
          return localStorage.Authorization;
        }
      }
    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider

      //Authentication - > Main, Signin, Signup, Forgot
      .state('auth',{
        url : '/auth',
        abstract : true,
        template : '<ion-nav-view></ion-nav-view>'
      })
      .state('auth.main',{
        url : '/main',
        templateUrl : CONSTANT.PATH.AUTH+"/auth.main."+CONSTANT.VIEW
      })
      .state('auth.signin', {
        url: '/signin',
        templateUrl: CONSTANT.PATH.AUTH+'/auth.signin.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      .state('auth.signup',{
        url : '/signup',
        templateUrl : CONSTANT.PATH.AUTH+'/auth.signup.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      .state('auth.forgot',{
        url : '/forgot',
        templateUrl : CONSTANT.PATH.AUTH+'/auth.forgot.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      // end : Authentication


      //landing
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view></ion-nav-view>'
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        templateUrl : 'template/profile/personalise.'+CONSTANT.VIEW,
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        templateUrl : 'template/profile/personalise.usertype.'+CONSTANT.VIEW
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        templateUrl : 'template/profile/personalise.usersubject.'+CONSTANT.VIEW
      })
      // learn app
      .state('user.main',{
        url : '/main',
        abstract : true,
        templateUrl : 'template/user/main.'+CONSTANT.VIEW,
        controller : 'userMainController as UserMain'
      })
      .state('user.main.profile',{
        url : '/profile',
        abstract : true,
        templateUrl : 'template/profile/profile.'+CONSTANT.VIEW
      })
      .state('user.main.profile.groups',{
        url : '/groups',
        views : {
          'group-tab' : {
            templateUrl : 'template/profile/profile.group.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.profile.badges',{
        url : '/badges',
        views : {
          'badge-tab':{
            templateUrl : 'template/profile/profile.badge.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.playlist',{
        url : '/playlist',
        templateUrl : 'template/playlist/playlist.'+CONSTANT.VIEW
      })
      .state('user.main.home',{
        url : '/home',
        templateUrl : 'template/home/home.'+CONSTANT.VIEW
      })
      .state('user.main.result',{
        url : '/result',
        templateUrl : 'template/result/result.'+CONSTANT.VIEW
      })
      .state('user.main.search',{
        url : '/search',
        templateUrl : 'template/search/search.'+CONSTANT.VIEW
      })

    $urlRouterProvider.otherwise('/auth/main');
  }
})();

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform"];
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }

})();

(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('userMainController',userMainController)

  userMainController.$inject = ['$state'];

  function userMainController($state) {
    var UserMain = this;

    UserMain.goToProfile = function(){ $state.go('user.main.profile',{})}
    UserMain.goToPlaylist = function(){ $state.go('user.main.playlist',{})}
    UserMain.goToHome = function(){ $state.go('user.main.home',{})}
    UserMain.goToResult = function(){ $state.go('user.main.result',{})}
    UserMain.goToSearch = function(){ $state.go('user.main.search',{})}
  }
})();

(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('authController', authController)

    authController.$inject = ['$state','Auth'];

  function authController($state,Auth) {
    var authCtrl = this;

    authCtrl.login = function(user_credentials) {
      console.log(user_credentials);
        Auth.login(user_credentials,function(){
          $state.go('user.main.home',{});
        },function(){
          // $state.go('authenticate.signin',{})
        })
    }
    authCtrl.signup = function () {
      $state.go('user.personalise.usertype',{});
    }
  }
})();
