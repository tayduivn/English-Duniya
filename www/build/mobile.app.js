(function() {
    'use strict';

    angular
        .module('common', [
          'ionic',
          'ngCordova'
        ]);
})();

(function() {
    'use strict';

    angular
        .module('zaya-map', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-intro', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-auth', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-user', [
          'ionic',
          'ionic-native-transitions',
        ]);
})();

(function() {
    'use strict';

    angular
        .module('zaya-profile', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-quiz', [
          'ui.sortable'
        ]);
})();

(function () {
  'use strict';

  angular
    .module('zaya', [
      // external
      'ionic',
      'restangular',
      'ionic-native-transitions',
      'ngMessages',
      'ngCookies',
      'ngCordovaOauth',

      // core
      'common',
      'zaya-map',
      'zaya-user',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
    ]);

})();

(function(){
    AppConfig.$inject = ["$httpProvider", "$ionicConfigProvider", "$ionicNativeTransitionsProvider", "$logProvider", "$windowProvider"];
  angular
    .module('zaya')
    .config(AppConfig)

    function AppConfig($httpProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider, $logProvider, $windowProvider){
      // global debug log
      $logProvider.debugEnabled(true);

      // request/response interceptors
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
              void 0;
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
      $ionicConfigProvider.views.maxCache(0);
      $ionicConfigProvider.tabs.position('bottom');
      $ionicNativeTransitionsProvider.enable(true, false);
    }
})();

(function() {
    'use strict';

    angular
        .module('zaya')
        .factory('Rest', Rest);

    Rest.$inject = ['Restangular','CONSTANT'];

    function Rest(Restangular, CONSTANT) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/api/v1');
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$urlRouterProvider", "$injector"];
  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($urlRouterProvider, $injector) {
    // anonymous function implemented to avoid digest loop
    $urlRouterProvider.otherwise(function ($injector) {
        $injector.get('$state').go('map.navigate');
    });
  }
})();

(function () {
  'use strict';
  runConfig.$inject = ["$ionicPlatform", "$rootScope", "$timeout", "$log", "$state", "$http", "$cookies", "Auth", "$window"];
  angular
    .module('zaya')
    .run(runConfig);
  function runConfig($ionicPlatform, $rootScope, $timeout, $log, $state, $http, $cookies, Auth, $window) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    //$http.defaults.headers.common['Access-Control-Request-Headers'] = 'accept, auth-token, content-type, xsrfcookiename';
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      // alternative to phaser destroy() ; phaser destroy doesn't remove canvas element
      if (toState.name != 'user.main.playlist') {
        try {
          var canvas = document.querySelector('#map_canvas');
          canvas.parentNode.removeChild(canvas);
          $log.debug("Canvas Removed");
        }
        catch (e) {
        }
      }

      //if not authenticated, redirect to login page
      if (!Auth.isAuthorised() && toState.name != 'auth.signin' && toState.name != 'auth.signup' && toState.name != 'auth.forgot') {
        $log.debug("You are not authorized");
        event.preventDefault();
        $state.go('auth.signin');
      }
       //if authenticated but not verified redirect to OTP page
      //if (Auth.isAuthorised() && !Auth.isVerified() && (toState.name == 'auth.forgot.verify_otp' || toState.name == 'auth.verify.phone') ) {
      //  $log.debug("User account not verified");
      //  return true;
      //}
      // if authenticated but not verified redirect to OTP page
      if (Auth.isAuthorised() && !Auth.isVerified() && toState.name != 'auth.verify.phone' && toState.name != 'auth.forgot_verify_otp' && toState.name != 'auth.change_password' ) {
        $log.debug("User account not verified");
        event.preventDefault();
        localStorage.clear();
        $state.go('auth.signin');
      }
      //if authenticated and verified, redirect to userpage
      if (Auth.isAuthorised() && Auth.isVerified() && (toState.name == 'auth.signin' || toState.name == 'auth.signup' || toState.name == 'intro' || toState.name == 'auth.verify.phone' || toState.name == 'auth.forgot' || toState.name == 'auth.change_password' || toState.name == 'auth.forgot_verify_otp')) {
        $log.debug("You are authorized and verified");
        event.preventDefault();
        $state.go('user.main.home');
      }
      // block access to quiz summary page if there is no quiz data
      if (toState.name == 'quiz.summary' && !toParams.quizSummary) {
        $log.debug("Quiz summary page cannot be accessed : No quiz data present");
        event.preventDefault();
      }

      if(toState.name == 'auth.verify.phone'){
        $log.debug("verify");
        document.addEventListener('onSMSArrive',function(e){
          $rootScope.$broadcast('smsArrived',{'message':e})
        });

      }

    });
    $ionicPlatform.ready(function () {

      try{
        SMS && SMS.startWatch(function () {
          $log.debug('start watching sms');
        }, function () {
          $log.debug('Failed to start sms watching');
        });
      }
      catch(error){
        $log.debug(error);
      }

      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }
})();

(function () {
  'use strict';
  angular
    .module('zaya-auth')
    .controller('authController', authController)
  authController.$inject = ['$q','$ionicModal', '$state', 'Auth', 'audio', '$rootScope', '$ionicPopup', '$log', '$cordovaOauth', 'CONSTANT', '$interval', '$scope', '$ionicLoading'];
  function authController($q,$ionicModal, $state, Auth, audio, $rootScope, $ionicPopup, $log, $cordovaOauth, CONSTANT, $interval, $scope, $ionicLoading) {
    var authCtrl = this;
    var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var indian_phone_regex = /^[7-9][0-9]{9}$/;
    //var username_regex = /^[a-z0-9]*$/;
    var min = 6;
    var max = 15;
    var country_code = '+91';
    authCtrl.audio = audio;
    authCtrl.login = login;
    authCtrl.logout = logout;
    authCtrl.signup = signup;
    authCtrl.openModal = openModal;
    authCtrl.closeModal = closeModal;
    authCtrl.rootScope = $rootScope;
    authCtrl.validCredential = validCredential;
    authCtrl.showError = showError;
    authCtrl.showAlert = showAlert;
    authCtrl.verifyOtpValidations = verifyOtpValidations;
    authCtrl.verifyOtp = verifyOtp;
    // authCtrl.getToken = getToken;
    authCtrl.passwordResetRequest = passwordResetRequest;
    authCtrl.validateForgotPasswordForm = validateForgotPasswordForm;
    authCtrl.resendOTP = resendOTP;
    authCtrl.max_counter = 60;
    authCtrl.startCounter = startCounter;
    authCtrl.stopCounter = stopCounter;
    authCtrl.signUpDisabled = false;
    authCtrl.resendOTPCount = 0;
    authCtrl.resendOTPDate = null;
    authCtrl.maxOTPsendCountperDay = 50;
    authCtrl.autoVerifyPhoneStatus = false;
    authCtrl.resetPasswordLinkSent = false;
    authCtrl.closeKeyboard = closeKeyboard;
    authCtrl.verifyOtpResetPassword = verifyOtpResetPassword;
    authCtrl.validCredentialChangePassword = validCredentialChangePassword;
    authCtrl.changePassword = changePassword;
    authCtrl.cancelOTP = cancelOTP;
    authCtrl.recoverAccount = recoverAccount;
    authCtrl.error = { "title" : "", "desc" : ""};


    function recoverAccount() {
        authCtrl.openModal('recover');
    }
    function openModal (modal) {
      if(modal == 'error'){
        authCtrl.errorModal.show();
      }
      else if(modal == 'recover'){
        authCtrl.recoveryModal.show();
      }
      else {
        return false;
      }

    }
    function closeModal (modal) {
      var q = $q.defer();

      if(modal == 'error'){
        q.resolve(authCtrl.errorModal.hide());
      }
      else if(modal == 'recover'){
        q.resolve(authCtrl.recoveryModal.hide());
      }
      else{
        q.reject(false);
      }

      return q.promise;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(recoveryModal) {
      authCtrl.recoveryModal = recoveryModal;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.AUTH + '/auth.error.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(errorModal) {
      authCtrl.errorModal = errorModal;
    });


    function validEmail(email) {
      return email_regex.test(email);
    }

    function validPhoneNumber(number) {
      return indian_phone_regex.test(number);
    }

    //function validUsername(username) {
    //  return username_regex.test(username);
    //}
    function login(url, user_credentials) {
      $ionicLoading.show({
        template: 'Logging in...'
      });
      user_credentials = ( url == 'login' ) ? cleanCredentials(user_credentials) : user_credentials;
      Auth.login(url, user_credentials, function (response) {
        Auth.getUser(function (success) {
          Auth.setAuthProvider(url);
          $ionicLoading.hide();
          $state.go('map.navigate', {});
        }, function () {
          $ionicLoading.hide();
          authCtrl.showError("Error Login", "Please enter a valid mobile no./Email ID and password");
        });
      }, function (response) {
        $ionicLoading.hide();
        if(response.data.details){
          authCtrl.showError("Error Login", response.data.details);
        }
        else{
          authCtrl.showError("Error Login", "Please enter a valid mobile no./Email ID and password");
        }
        authCtrl.audio.play('wrong');
      })
    }

    function signup(user_credentials) {
      $ionicLoading.show({
        template: 'Signing up...'
      });
      user_credentials = cleanCredentials(user_credentials);
      authCtrl.signUpDisabled = true;
      Auth.signup(user_credentials, function (response) {
        $state.go('auth.verify.phone', {});
        $ionicLoading.hide();
        authCtrl.signUpDisabled = false;
      }, function (response) {
        $ionicLoading.hide();
        //  authCtrl.showError(_.chain(response.data).keys().first(), response.data[_.chain(response.data).keys().first()].toString());
        if(response.data)
        {
          authCtrl.showError("Could not register", response.data.details);
        }
        else
        {
          authCtrl.showError("Could not register", "Please enter a valid mobile no. and password");
        }
        authCtrl.audio.play('wrong');
        authCtrl.signUpDisabled = false;
      })
    }

    function logout(path) {
      Auth.logout(function () {
        $state.go(path, {})
      }, function () {
        // body...
      })
    }

    // web social login / will be used in web apps
    // function getToken(webservice) {
    //   if (webservice == 'facebook') {
    //     $cordovaOauth.facebook(CONSTANT.CLIENTID.FACEBOOK, ["email"]).then(function (result) {
    //       authCtrl.login('facebook', {"access_token": result.access_token});
    //     }, function (error) {
    //       authCtrl.showError("Error", error);
    //     });
    //   }
    //   if (webservice == 'google') {
    //     $cordovaOauth.google(CONSTANT.CLIENTID.GOOGLE, ["email"]).then(function (result) {
    //       authCtrl.login('google', {"access_token": result.access_token});
    //     }, function (error) {
    //       authCtrl.showError("Error", error);
    //     });
    //   }
    // }

    function cleanCredentials(user_credentials) {
      if (validEmail(user_credentials.useridentity)) {
        user_credentials['email'] = user_credentials.useridentity;
      }
      else if (!isNaN(parseInt(user_credentials.useridentity, 10)) && validPhoneNumber(parseInt(user_credentials.useridentity, 10))) {
        user_credentials['phone_number'] = country_code + user_credentials.useridentity;
      }
      delete user_credentials['useridentity'];
      return user_credentials;
    }

    function validCredential(formData) {
      if (!formData.useridentity.$viewValue) {
        authCtrl.showError("Empty", "Its empty! Enter a valid phone number or email");
        return false;
      }
      else if (formData.useridentity.$viewValue && formData.useridentity.$viewValue.indexOf('@') != -1 && !validEmail(formData.useridentity.$viewValue)) {
        authCtrl.showError("Email", "Oops! Please enter a valid email");
        return false;
      }
      else if (formData.useridentity.$viewValue && !isNaN(parseInt(formData.useridentity.$viewValue, 10)) && !validPhoneNumber(formData.useridentity.$viewValue) && !validEmail(formData.useridentity.$viewValue)) {
        authCtrl.showError("Phone", "Oops! Please enter a valid mobile no.");
        return false;
      }
      else if (!formData.password.$viewValue) {
        authCtrl.showError("Password", "Its empty! Enter a valid password");
        return false;
      }
      else if (formData.password.$viewValue.length < min) {
        authCtrl.showError("Password", "Minimum " + min + " characters required");
        return false;
      }
      else if (formData.password.$viewValue.length > max) {
        authCtrl.showError("Password", "Maximum " + max + " can be used");
        return false;
      }
      else if (formData.email && formData.email.$viewValue && !validEmail(formData.email.$viewValue)) {
        authCtrl.showError("Email", "Oops! Please enter a valid email");
        return false;
      }
      return true;
    }

    function showError(title, msg) {
      $log.debug(title, msg);
      authCtrl.error.title = title;
      authCtrl.error.desc = msg;
      authCtrl.openModal('error');
      // $ionicPopup.alert({
      //   title: title,
      //   template: msg
      // });
    }

    function showAlert(title, msg) {
      $log.debug(title, msg);
      authCtrl.error.title = title;
      authCtrl.error.desc = msg;
      authCtrl.openModal('error');
      // $ionicPopup.alert({
      //   title: title,
      //   template: msg
      // }).then(function (response) {
      //   if (success) {
      //     success()
      //   }
      // });
    }

    function verifyOtpValidations(formData) {
      if (!formData.otp.$viewValue) {
        authCtrl.showError("OTP", "Its empty! Enter the one time password");
        return false;
      }
      $log.debug("OTP validations passed");
      return true;
    }

    function verifyOtp(otp_credentials) {
      $ionicLoading.show({
        template: 'Verifying...'
      });
      Auth.verifyOtp(otp_credentials, otpVerifiedSuccessHandler, function (error) {
        $ionicLoading.hide();
        authCtrl.showError("Incorrect OTP!", "The one time password you entered is incorrect!");
      })
    }

    function passwordResetRequest(user_credentials) {
      $ionicLoading.show({
        template: 'Requesting...'
      });
      $log.debug(user_credentials);
      user_credentials = cleanCredentials(user_credentials);
      $log.debug(user_credentials);
      Auth.resetPassword(user_credentials, function (success) {
        if (user_credentials.hasOwnProperty('phone_number')) {
          localStorage.setItem('Authorization', success.token);
          authCtrl.closeModal('recover');
          $state.go('auth.forgot_verify_otp');
        }
        else {
          authCtrl.showAlert("Reset Password", "We have send a link to your email");
        }
        authCtrl.resetPasswordLinkSent = true;
        $ionicLoading.hide();
      }, function (error) {
        authCtrl.showAlert("Not Registered", "Mobile no. /Email ID is not registered.");
        $ionicLoading.hide();
      })
    }

    function validateForgotPasswordForm(formData) {
      $log.debug(formData);
      if (!formData.useridentity.$viewValue) {
        authCtrl.showError("Empty", "Its empty! Enter a valid phone number or email");
        return false;
      }
      else if (formData.useridentity.$viewValue && formData.useridentity.$viewValue.indexOf('@') != -1 && !validEmail(formData.useridentity.$viewValue)) {
        authCtrl.showError("Email", "Oops! Please enter a valid email");
        return false;
      }
      else if (formData.useridentity.$viewValue && !isNaN(parseInt(formData.useridentity.$viewValue, 10)) && !validPhoneNumber(formData.useridentity.$viewValue)) {
        authCtrl.showError("Phone", "Oops! Please enter a valid mobile no.");
        return false;
      }
      return true;
    }

    function resendOTP() {
      if (Auth.canSendOtp(authCtrl.maxOTPsendCountperDay)) {
        Auth.resendOTP(function (success) {
          authCtrl.showAlert("OTP Sent", "We have sent you otp again");
          authCtrl.startCounter();
          authCtrl.autoVerifyPhoneStatus = 'Waiting For SMS';
        }, function (error) {
          authCtrl.showError(error);
        })
      }
      else {
        authCtrl.showAlert("OTP Resend count exceed", "Sorry you cant send more otps try again tomorrow");
      }
    }

    function startCounter() {
      authCtrl.counter = authCtrl.max_counter;
      authCtrl.start = $interval(function () {
        if (authCtrl.counter > 0) {
          authCtrl.counter--;
        } else {
          authCtrl.stopCounter();
        }
      }, 1000);
      return true;
    }

    function stopCounter() {
      if (angular.isDefined(authCtrl.start)) {
        $interval.cancel(authCtrl.start);
      }
    }

    $scope.$on('smsArrived', function (event, data) {
      $ionicLoading.show({
        template: 'Getting OTP From SMS'
      });
      authCtrl.autoVerifyPhoneStatus = 'Getting OTP From SMS';
      Auth.getOTPFromSMS(data.message, function (otp) {
        $ionicLoading.show({
          template: 'OTP received. Verifying..'
        });
        authCtrl.autoVerifyPhoneStatus = 'OTP received. Verifying..';
        Auth.verifyOtp({'code': otp}, function (success) {
          authCtrl.autoVerifyPhoneStatus = 'Verified';
          otpVerifiedSuccessHandler(success);
        }, function () {
          $ionicLoading.hide();
          authCtrl.autoVerifyPhoneStatus = 'Error Verifying OTP. Try Again';
        });
      }, function () {
        $ionicLoading.hide();
        authCtrl.autoVerifyPhoneStatus = 'Error Getting OTP From SMS';
        //authCtrl.showError("Could not get OTP","Error fetching OTP");
      });
      if (SMS) {
        SMS.stopWatch(function () {
          $log.debug('watching', 'watching stopped');
        }, function () {
          updateStatus('failed to stop watching');
        });
        SMS.startWatch(function () {
          $log.debug('watching', 'watching started');
        }, function () {
          updateStatus('failed to start watching');
        });
      }
    });
    function otpVerifiedSuccessHandler(success) {
      Auth.getUser(function (success) {
        $ionicLoading.hide();
        authCtrl.showAlert("Correct!", "Phone Number verified!");
        $state.go('user.personalise.social', {});
      }, function (error) {
        $ionicLoading.hide();
        authCtrl.showError("Error", "Could not verify OTP. Try again");
      });
    }

    authCtrl.numberOfWatches = function () {
      var root = angular.element(document.getElementsByTagName('body'));
      var watchers = [];
      var f = function (element) {
        angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
          if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
            angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
              watchers.push(watcher);
            });
          }
        });
        angular.forEach(element.children(), function (childElement) {
          f(angular.element(childElement));
        });
      };
      f(root);
      // Remove duplicate watchers
      var watchersWithoutDuplicates = [];
      angular.forEach(watchers, function (item) {
        if (watchersWithoutDuplicates.indexOf(item) < 0) {
          watchersWithoutDuplicates.push(item);
        }
      });
      $log.debug(watchersWithoutDuplicates);
    };
    authCtrl.googleSignIn = function () {
      $ionicLoading.show({
        template: 'Logging in...'
      });
      try{
        window.plugins.googleplus.login(
          {
            'scopes': 'email profile',
            'webApiKey': '306430510808-i5onn06gvm82lhuiopm6l6188133j5r4.apps.googleusercontent.com',
            'offline': true
          },
          function (user_data) {
            authCtrl.login('google', {"access_token": user_data.oauthToken});
            // For the purpose of this example I will store user data on local storage
            //UserService.setUser({
            //  userID: user_data.userId,
            //  name: user_data.displayName,
            //  email: user_data.email,
            //  picture: user_data.imageUrl,
            //  accessToken: user_data.accessToken,
            //  idToken: user_data.idToken
            //});
          },
          function (msg) {
            authCtrl.showError("Error",msg);
            $ionicLoading.hide();
          }
        );
      }
      catch(e){
        $log.debug(e);
      }
    };
    authCtrl.googleSignOut = function () {
      window.plugins.googleplus.logout(
        function (msg) {
          void 0;
        }
      );
    };
    authCtrl.facebookSignIn = function () {
      facebookConnectPlugin.login(['email', 'public_profile'], function (success) {
        authCtrl.login('facebook', {"access_token": success.authResponse.accessToken});
      }, function () {
      })
    };
    function closeKeyboard() {
      try{
        cordova.plugins.Keyboard.close();
      }
      catch(e){
        $log.debug(e);
      }
      return true;
    }
    function verifyOtpResetPassword(otp){
        Auth.verifyOtpResetPassword(otp,function(success){
          $log.debug(success);
          $state.go('auth.change_password', {});
        },function(error){
          $log.debug(error);
          authCtrl.showAlert("InCorrect!", "You entered wrong OTP!");
        })
    }
    function validCredentialChangePassword(formData) {
      if (!formData.password1.$viewValue) {
        authCtrl.showError("Enter Password", "Its empty! Enter a password");
        return false;
      }
      else if(formData.password1.$viewValue.length < 6){
        authCtrl.showError("Password too small", "Password must be 6 characters long");
        return false;
      }
      else if(typeof(formData.password2.$viewValue) == 'undefined' || !angular.equals(formData.password2.$viewValue,formData.password1.$viewValue)){
        authCtrl.showError("Confirm Password", "Please confirm your password");
        return false;
      }
      return true;
    }
    function changePassword(credentials){
      credentials.secret_key = '@#2i0-jn9($un1w8utqc2dms!$#5+5';
      Auth.changePassword(credentials,function(success){
        authCtrl.showAlert('Success','You have reset your password');
        $log.debug(success);
        $state.go('auth.signin', {});
      },function(error){
        $log.debug(error);
      })
    }
    function cancelOTP(){
     localStorage.clear();
      $state.go('auth.signin',{});
    }

  }
})();

(function () {
  'use strict';
  angular
    .module('zaya-auth')
    .factory('Auth', Auth)
  Auth.$inject = ['Restangular', 'CONSTANT', '$cookies', '$log', '$window'];
  function Auth(Restangular, CONSTANT, $cookies, $log, $window) {
    var rest_auth = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/rest-auth');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
    return {
      login: function (url, user_credentials, success, failure) {
        rest_auth.all(url).post($.param(user_credentials)).then(function (response) {
          localStorage.setItem('Authorization', response.key || response.token);
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      logout: function (success, failure) {
        rest_auth.all('logout').post().then(function (response) {
          if(localStorage.getItem('authProvider') == 'google')
          {
            window.plugins.googleplus.logout();
          }
          if(localStorage.getItem('authProvider') == 'facebook')
          {
            facebookConnectPlugin.logout();
          }
          localStorage.removeItem('Authorization');
          localStorage.removeItem('user_details');
          localStorage.removeItem('authProvider');
          success();
        }, function (error) {
          failure();
        })
      },
      signup: function (user_credentials, success, failure) {
        rest_auth.all('registration').post($.param(user_credentials), success, failure).then(function (response) {
          localStorage.setItem('Authorization', response.key);
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      reset: function (email, atype, success, failure) {
        type == 'password' && rest_auth.all('password').all('reset').post(email);
        type == 'username' && rest_auth.all('username').all('reset').post(email);
      },
      isAuthorised: function () {
        return localStorage.Authorization;
      },
      canSendOtp: function (max_otp_send_count) {
        var last_otp_date = localStorage.getItem('last_otp_date');
        var otp_sent_count = localStorage.getItem('otp_sent_count');
        if (last_otp_date && otp_sent_count) {
          if (this.dateCompare(new Date(), new Date((last_otp_date)))) {
            localStorage.setItem('last_otp_date', new Date());
            localStorage.setItem('otp_sent_count', 1);
            return true;
          } else {
            if (otp_sent_count < max_otp_send_count) {
              localStorage.setItem('last_otp_date', new Date());
              localStorage.setItem('otp_sent_count', ++otp_sent_count);
              return true;
            } else {
              return false;
            }
          }
        }
        else {
          localStorage.setItem('last_otp_date', new Date());
          localStorage.setItem('otp_sent_count', 1);
          return true;
        }
      },
      // remove util funstion from auth factory
      dateCompare: function (date_1, date_2) { // Checks if date_1 > date_2
        var month_1 = date_1.getMonth();
        var month_2 = date_2.getMonth();
        var day_1 = date_1.getDate();
        var day_2 = date_2.getDate();
        if (month_1 > month_2) {
          return true;
        } else if (month_1 == month_2) {
          return day_1 > day_2;
        } else return false;
      },
      verifyOtp: function (verification_credentials, success, failure) {
        $log.debug(JSON.stringify(verification_credentials));
        rest_auth.all('sms-verification').post($.param(verification_credentials), success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      resetPassword: function (reset_password_credentials, success, failure) {
        rest_auth.all('password/reset').post($.param(reset_password_credentials), success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      resendOTP: function (success, failure) {
        rest_auth.all('resend-sms-verification').post('', success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      getUser: function (success, failure) {
        Restangular.oneUrl('user_details', CONSTANT.BACKEND_SERVICE_DOMAIN + 'rest-auth/user/').get().then(function (response) {
          localStorage.setItem('user_details', JSON.stringify(response));
          success(response);
        }, function (response) {
          failure(response);
        });
      },
      isVerified: function () {
        var user_details = JSON.parse(localStorage.getItem('user_details'));
        if (user_details) {
          return user_details.is_verified;
        }
        else {
          return false;
        }
      },
      getOTPFromSMS: function (message,success,failure) {
        var string = message.data.body;
        if(message.data.address == '+12023353814')
        {
          var e_position = string.indexOf("Enter");
          var o_position = string.indexOf("on");
          success(string.substring(e_position + 6, o_position - 1));
        }
        else{
          failure();
        }

      },
      setAuthProvider: function (authProvider){
        localStorage.setItem('authProvider',authProvider);
        return authProvider;
      },
      verifyOtpResetPassword: function(otp,success,failure){
        rest_auth.all('password/reset/sms-verification').post($.param(otp), success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      changePassword: function (credentials, success, failure) {
        rest_auth.all('password/change').post($.param(credentials), success, failure).then(function (response) {
          localStorage.removeItem('Authorization');
          success(response);
        }, function (response) {
          failure(response);
        })
      }
    }
  }
})();

(function() {
  'use strict';

  authRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-auth')
    .config(authRoute);

  function authRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
    .state('auth', {
        url: '/auth',
        abstract: true,
        template: "<ion-nav-view name='state-auth'></ion-nav-view>",
      })
      // intro is now the main screen
      // .state('auth.main', {
      //   url: '/main',
      //   views: {
      //     'state-auth': {
      //       templateUrl: CONSTANT.PATH.AUTH + "/auth.main" + CONSTANT.VIEW
      //     }
      //   }
      // })
      .state('auth.signin', {
        url: '/signin',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signin' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signin.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.signup', {
        url: '/signup',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signup' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signup.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot', {
        url: '/forgot',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot_verify_otp', {
        url: '/verifyotp',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.verify' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.change_password', {
        url: '/changepassword',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.changepassword' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.verify',{
        abstract : true,
        url : '/verify',
        views : {
          "state-auth" : {
            template : "<ion-nav-view name='state-auth-verify'></ion-nav-view>"
          }
        }
      })
      .state('auth.verify.phone', {
        url: '/phone',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
        },
        views: {
          'state-auth-verify': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.verify.phonenumber' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
  }
})();

(function(){
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://cc-test.zaya.in/',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.6:9000/',
      'PATH' : {
        'INTRO' : ROOT+'/intro',
        'AUTH' : ROOT+'/auth',
        'QUIZ' : ROOT+'/quiz',
        'PROFILE' : ROOT+'/profile',
        'USER' : ROOT+'/user',
        'PLAYLIST' : ROOT+'/playlist',
        'HOME' : ROOT+'/home',
        'RESULT' : ROOT+'/result',
        'SEARCH' : ROOT+'/search',
        'GROUP' : ROOT+'/group',
        'COMMON' : ROOT + '/common',
        'MAP' : ROOT + '/map',
        'CONTENT' : ROOT + '/content'
      },
      'VIEW' : '.view.html',
      'CLIENTID' : {
        'FACEBOOK' : '1159750564044149',
        'GOOGLE' : '1011514043276-7q3kvn29jkegl2d1v7dtlbtipqqgo1rr.apps.googleusercontent.com',
        'ELL' : '1e7aa89f-3f50-433a-90ca-e485a92bbda6'
      },
      'ASSETS' : {
        'IMG' : {
          'ICON' : 'img/icons'
        }
      }
    })
})();

(function() {
  angular
    .module('zaya')
    .directive('widgetCarousel', widgetCarousel)
    .directive('carouselItem', carouselItem);

  function widgetCarousel() {
    var carousel = {}
    carousel.restrict = 'A';
    carousel.link = function(scope) {
      scope.initCarousel = function(element) {
        // provide any default options you want
        var defaultOptions = {};
        var customOptions = scope.$eval($(element).attr('carousel-options'));
        // combine the two options objects
        for (var key in customOptions) {
          if (customOptions.hasOwnProperty(key)) {
            defaultOptions[key] = customOptions[key];
          }
        }
        // init carousel
        $(element).owlCarousel(defaultOptions);
      };
    }
    return carousel;
  }

  function carouselItem() {
    var carouselItem = {};
    carouselItem.restrict = 'A';
    carouselItem.transclude = false;
    carouselItem.link = function(scope, element) {
      // wait for the last item in the ng-repeat then call init
      if (scope.$last) {
        scope.initCarousel(element.parent());
      }
    }
    return carouselItem;
  }
})();

(function(){
	widgetError.$inject = ["CONSTANT"];
	angular
		.module('common')
		.directive('widgetError',widgetError)

	function widgetError(CONSTANT){
		var error = {};
		error.restrict = 'E';
		error.templateUrl = CONSTANT.PATH.COMMON + '/common.error' + CONSTANT.VIEW;
		error.controller = ['$rootScope','$scope',function ($rootScope,$scope) {
			$scope.error = function(){
				return $rootScope.error;
			}
		}]
		return error;
	}
})();

(function() {
    'use strict';

    angular
        .module('common')
        .directive('validInput', validInput);

    function validInput() {
        var validInput = {
            require: '?ngModel',
            link: linkFunc
        };

        return validInput;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }
          ngModelCtrl.$parsers.push(function(val) {
            var clean = val.replace( /[^a-zA-Z0-9@.!#$%&'*+-/=?^_`{|}~]+/g, '');
            clean = clean.toLowerCase();
            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
        }
    }
})();

(function() {
    'use strict';

    validOtp.$inject = ["$log"];
    angular
        .module('common')
        .directive('validOtp', validOtp);

    function validOtp($log) {
        var validOtp = {
            require: '?ngModel',
            link: linkFunc
        };

        return validOtp;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }

          ngModelCtrl.$parsers.push(function(val) {
            var clean = (val > 999999)?(val.toString()).substring(0,6):val;
            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
        }
    }
})();

(function() {
  'use strict';

  trackVideo.$inject = ["$window", "$log", "orientation"];
  angular
    .module('common')
    .directive('trackVideo', trackVideo);

  /* @ngInject */
  function trackVideo($window, $log, orientation) {
    var video = {
      restrict: 'A',
      link: linkFunc,
    };

    return video;

    // full screen not working ; instead used css to immitate full screen effect ; check below
    function toggleFullScreen() {
      if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }

    function linkFunc(scope, el, attr, ctrl) {
      el.bind('playing', function() {
        // toggleFullScreen();
        el.addClass('fullscreen');
        orientation.setLandscape();
      });
      el.bind('pause', function() {
        // toggleFullScreen();
        el.removeClass('fullscreen');
        orientation.setPortrait();
      });
      el.bind('click',function (event) {
        event.stopPropagation();
      })
    }
  }

})();

(function () {
  'use strict';

    audio.$inject = ["$cordovaNativeAudio"];
  angular
    .module('common')
    .factory('audio',audio)

    function audio($cordovaNativeAudio) {
      return {
        play : function (sound) {
          try{
            $cordovaNativeAudio.play(sound);
            void 0;
          }
          catch(error){
            void 0;
          }
        }
      };
    }
})();

(function() {
    'use strict';

    angular
        .module('common')
        .factory('orientation', orientation);

    orientation.$inject = ['$window','$log'];

    /* @ngInject */
    function orientation($window, $log) {
        var orientation = {
            setLandscape : setLandscape,
            setPortrait : setPortrait
        };

        return orientation;

        function setPortrait() {
          try{
            $window.screen.lockOrientation('portrait');
          }
          catch(e){
            $log.debug(e);
          }
        }

        function setLandscape() {
          try{
            $window.screen.lockOrientation('landscape');
          }
          catch(e){
            $log.debug(e);
          }
        }
    }
})();

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform", "$cordovaNativeAudio"];
  angular
    .module('common')
    .run(runConfig);

  function runConfig($ionicPlatform,$cordovaNativeAudio) {
    $ionicPlatform.ready(function() {
      try{
        $cordovaNativeAudio.preloadSimple('water-drop', 'sound/water-drop.mp3');
        $cordovaNativeAudio.preloadSimple('correct', 'sound/correct.mp3');
        $cordovaNativeAudio.preloadSimple('wrong', 'sound/wrong.mp3');
      }
      catch(error){
        void 0;
      }
    });
  }

})();

(function() {
    'use strict';

    angular
        .module('zaya-intro')
        .controller('introController', introController);

    introController.$inject = [];

    /* @ngInject */
    function introController() {
        var introCtrl = this;

        introCtrl.tabIndex = 0;
        introCtrl.slides = [
          {
            title : "Hello this Title",
            description : "some description is theresome description is theresome description is there",
            img : "img/01.png",
            color : "bg-brand-light"
          },
          {
            title : "Hello this Title",
            description : "some description is theresome description is theresome description is there",
            img : "img/02.png",
            // color : "bg-brand-light"
            color : "bg-assertive-light"
          },
          {
            title : "Hello this Title",
            description : "some description is theresome description is theresome description is there",
            img : "img/03.png",
            // color : "bg-brand-light"
            color : "bg-royal-light"
          }
        ];
    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-intro')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
      .state('intro',{
        url : '/intro',
        templateUrl : CONSTANT.PATH.INTRO+'/intro'+CONSTANT.VIEW,
        controller : "introController as introCtrl"
      })
  }
})();

(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope','$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'Rest', 'CONSTANT', '$sce', 'orientation'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, Rest, CONSTANT, $sce, orientation) {
    var mapCtrl = this;
    mapCtrl.lessons = lessons;
    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    mapCtrl.getIcon = getIcon;
    mapCtrl.resourceType = resourceType;
    mapCtrl.playResource = playResource;
    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;

    orientation.setPortrait();
    function playResource (resource, event) {
      if(mapCtrl.resourceType(resource) != 'video'){
        $scope.closeModal();
        $state.go('quiz.questions',{id : resource.node.id});
      }
      else{
        event.stopPropagation();
      }

    }
    function resourceType (resource){
      if(resource.node.content_type_name == 'assessment'){
        return 'assessment';
      }
      else if(resource.node.content_type_name == 'resource'){
        if(resource.node.type.file_type.substring(0,resource.node.type.file_type.indexOf('/')) == 'video'){
          return 'video';
        }
      }
      else {}
    }
    function getSrc(src){
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }
    function getIcon(resource){
      if(resource.node.content_type_name == 'assessment'){
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      }
      else if(resource.node.content_type_name == 'resource'){
        if(resource.node.type.file_type.substring(0,resource.node.type.file_type.indexOf('/')) == 'video'){
          return CONSTANT.ASSETS.IMG.ICON + '/video.png';
        }
      }
      else {

      }
    }

    $scope.$on('logout', function() {
      $state.go('user.main.settings',{});
    })
    $scope.$on('openNode', function(event, node) {
      $scope.openModal();
      $log.debug('lesson id : ',node.id);
      $log.debug(mapCtrl.getLesson(node.id));
    })
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.openModal = function() {
      $scope.modal.show();
    }
    $scope.closeModal = function() {
      $scope.modal.hide();
    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose : false
    }).then(function(modal) {
      $scope.modal = modal;
    });

    function resetNode(){
        mapCtrl.selectedNode = {};
    }

    function getLesson(id) {
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $log.debug('lesson details : ',response.plain());
        mapCtrl.selectedNode = response.plain();
        $log.debug('selected node : ', mapCtrl.selectedNode);
      })
    }
  }
})();

(function() {
    'use strict';

    mapCanvas.$inject = ["$injector", "$timeout", "$log"];
    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $timeout, $log) {
        var mapCanvas = {
            restrict: 'A',
            template: '<div id="map_canvas"></div>',
            scope: {
              lessons : '='
            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          $timeout(createGame(scope, scope.lessons, $injector, $log));
        }
    }

})();

window.createGame = function(scope, lessons, injector, log) {
  'use strict';

  var lessons = lessons;
  var game = new Phaser.Game("100", "100" , Phaser.AUTO, 'map_canvas');
  var playState = {
    preload : function () {
      this.load.image('desert', 'img/assets_v0.0.3/desert_bg.png');
      this.load.image('cactus', 'img/assets_v0.0.3/cactus.png');
      this.load.image('tent', 'img/assets_v0.0.3/tent_fire.png');
      this.load.image('practice', 'img/icons/practice_active.png');
      // this.load.spritesheet('cactus_animation', 'img/assets_v0.0.2/cactus_sprite.png', 15, 17, 8);
      this.load.image('node', 'img/assets_v0.0.3/node.png');
      // debug value
      this.game.time.advancedTiming = true;
    },
    create : function() {
      var desert = this.game.add.sprite(0,this.game.height * i,'desert');
      desert.scale.setTo(game.world.width/desert.width, 1);

      this.game.world.setBounds(0, 0, this.game.width, desert.height);

      // place tent
      for (var i = 0; i < 3; i++) {
        var tent = this.game.add.sprite(this.game.rnd.between(10,this.game.world.width-10), this.game.rnd.between(0,this.game.world.height),'tent');
      }
      // place cactus
      for (var i = 0; i < 20; i++) {
        var cactus = this.game.add.sprite(this.game.rnd.between(50,this.game.world.width-50), this.game.rnd.between(50,this.game.world.height-50),'cactus');
        // catcus animation
        // var cactus_animation = this.game.add.sprite(this.game.rnd.between(10,this.game.world.width-10), this.game.rnd.between(0,this.game.world.height), 'cactus_animation');
        // cactus_animation.scale.setTo(3,3);
        // var walk = cactus_animation.animations.add('walk');
        // cactus_animation.animations.play('walk', 10, true);
      }

      // placing lesson node
      // 1. lesson node count
      // 2. Node should follow a particular path
      // path
      this.points = {
        'x': [100, 200, 100, game.world.centerX, game.world.centerX],
        'y': [0, 400, 800, 1300, game.world.height]
      };
      this.increment = 1 / game.world.height;

      // Somewhere to draw to
      this.bmd = this.add.bitmapData(this.game.width, this.game.world.height);
      this.bmd.addToWorld();
      // Draw the path
      for (var j = 0; j < 1; j += this.increment) {
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        this.bmd.rect(posx, posy, 4, 4, '#219C7F');
      }
      // Place nodes
      for (var j = 0, i = lessons.length-1, nodeCount = 1/lessons.length; j < 1; j += nodeCount, i--) {
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        var node = this.game.add.button(posx, posy, 'node', function (node) {
          scope.$emit('openNode',node);
        }, this, 2, 1, 0);
        node.anchor.setTo(0.5, 0.5);
        node.id = lessons[i].id;
      }

      var logout = this.game.add.button(this.game.width - 100, 0, 'practice',function () {
        scope.$emit('logout');
      },this, 2 , 1 , 0);
      logout.scale.setTo(0.3,0.3);
      logout.fixedToCamera = true;
      logout.cameraOffset.setTo(this.game.width - 70, 20);

      this.init();
      this.game.kineticScrolling.start();
    },
    init : function() {
      this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
      this.game.kineticScrolling.configure({
        kineticMovement: true,
        timeConstantScroll: 325, //really mimic iOS
        horizontalScroll: false,
        verticalScroll: true,
        horizontalWheel: false,
        verticalWheel: true,
        deltaWheel: 40
    });
      this.game.camera.y = ((~~this.world.height/this.game.height)-1) * this.game.height;
    },

    update : function() {
      // this.dragMap();
    },

    render : function(){
      this.game.debug.text("fps : "+game.time.fps || '--', 2, 14, "#00ff00");
    }
  }

  game.state.add('play',playState);
  game.state.start('play');

  // phaser destroy doesn't remove canvas element --> removed manually in app run
  scope.$on('$destroy', function() {
    game.destroy(); // Clean up the game when we leave this scope
  });
};

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-map')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('map',{
        url : '/map',
        abstract : true,
          resolve : {
            lessons : ['Rest','$log',function(Rest, $log){
              return Rest.one('accounts', CONSTANT.CLIENTID.ELL).getList('lessons').then(function(lessons) {
                $log.debug(lessons.plain());
                return lessons.plain();
              })
            }]
          },
        template : '<ion-nav-view name="state-map"></ion-nav-view>'
      })
      .state('map.navigate',{
        url : '/navigate',
        views : {
          'state-map' : {
            templateUrl : CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            controller : 'mapController as mapCtrl'
          }
        }
      })
  }
})();

(function() {
    'use strict';

    angular
        .module('zaya-profile')
        .controller('profileController', profileController);

    profileController.$inject = ['CONSTANT','$state','Auth','Rest','$log','$ionicPopup'];

    function profileController(CONSTANT, $state, Auth, Rest, $log, $ionicPopup) {
        var profileCtrl = this;
        profileCtrl.createProfile = createProfile;
        profileCtrl.updateProfile = updateProfile;
        profileCtrl.logout = logout;
        profileCtrl.calcAge = calcAge;

        profileCtrl.tabIndex = 0;
        profileCtrl.tab = [
          {
            type : 'group',
            path : CONSTANT.PATH.PROFILE + '/profile.groups' + CONSTANT.VIEW,
            icon : 'ion-person-stalker'
          },
          {
            type : 'badge',
            path : CONSTANT.PATH.PROFILE + '/profile.badges' + CONSTANT.VIEW,
            icon : 'ion-trophy'
          }
        ]

        function calcAge(dateString) {
          var birthday = +new Date(dateString);
          return ~~((Date.now() - birthday) / (31557600000));
        }

        function createProfile (userdata) {
          Rest.all('profiles').post(userdata).then(function(response){
            $state.go('map.navigate',{});
          },function(error){
            $ionicPopup.alert({
              title : _.chain(error.data).keys().first(),
              template : error.data[_.chain(error.data).keys().first()].toString(),
            });
          })
        }

        function updateProfile(userdata) {
          // body...
        }

        function logout() {
          Auth.logout(function () {
            $state.go('auth.signin',{})
          },function () {
            // body...
          })
        }

    }
})();

(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz','$stateParams', '$state', '$scope', 'audio','$log','$ionicModal', 'CONSTANT'] ;

  function QuizController(quiz, $stateParams, $state, $scope, audio, $log, $ionicModal, CONSTANT) {
    var quizCtrl = this;

    quizCtrl.quiz = quiz;
    quizCtrl.audio = audio;
    quizCtrl.init = init;

    // traversing the question
    quizCtrl.isCurrentIndex = isCurrentIndex;
    quizCtrl.setCurrentIndex = setCurrentIndex;
    quizCtrl.getCurrentIndex = getCurrentIndex;
    quizCtrl.prevQuestion = prevQuestion;
    quizCtrl.nextQuestion = nextQuestion;

    //log attempts & feedback
    quizCtrl.decide = decide;
    quizCtrl.canSubmit = canSubmit;
    quizCtrl.feedback = feedback;
    quizCtrl.submitAttempt = submitAttempt;
    quizCtrl.isAttempted = isAttempted;
    quizCtrl.isCorrect = isCorrect;
    quizCtrl.isCorrectAttempted = isCorrectAttempted;
    quizCtrl.isKeyCorrect = isKeyCorrect;
    quizCtrl.isKeyAttempted = isKeyAttempted;


    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);

    //audio
    quizCtrl.playAudio = playAudio;


    //question layouts
    quizCtrl.GRID_TYPE = ['audio_to_text','text_to_pic','pic_to_text','audio_to_pic'];
    quizCtrl.LIST_TYPE = ['audio_to_text_longer','text_to_pic_longer','pic_to_text_longer','audio_to_pic_longer'];

    $scope.modal = {};

    function init (quiz) {

      // init report object
      if($state.current.name=="quiz.summary"){
        quizCtrl.report = $stateParams.report;
      }
      else if($state.current.name=="quiz.questions"){
        quizCtrl.report = {};
        quizCtrl.report.quiz_id =  quiz.node.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.objects.length; i++) {
          quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
        }
        // init attempted

        for (var i = 0; i < quizCtrl.quiz.objects.length; i++) {
          if((quizCtrl.quiz.objects[i].node.type.type=='choicequestion' && !quizCtrl.quiz.objects[i].node.type.content.is_multiple) /*|| quizCtrl.quiz.objects[i].node.content_type=='dr question'*/){
            quizCtrl.quiz.objects[i].attempted = "";
          }
          else if(quizCtrl.quiz.objects[i].node.type.type=='choicequestion' && quizCtrl.quiz.objects[i].node.type.content.is_multiple){
            quizCtrl.quiz.objects[i].attempted = {};
          }
          //else if(quizCtrl.quiz.objects[i].node.content_type=='sentence ordering' || quizCtrl.quiz.objects[i].node.content_type=='sentence structuring'){
          //  quizCtrl.quiz.objects[i].attempted = [];
          //}
          else{}
        }
      }
      else{}

    }

    function isCurrentIndex (index) {

      return quizCtrl.currentIndex == index;
    }

    function setCurrentIndex(index) {

      quizCtrl.currentIndex = index;
    }

    function getCurrentIndex() {

      return quizCtrl.currentIndex;
    }

    function prevQuestion() {

      quizCtrl.currentIndex = (quizCtrl.currentIndex > 0) ? --quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function nextQuestion() {

      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function decide() {
      $log.debug("decide");
      if(!quizCtrl.isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])){
        $log.debug("!quizCtrl.isCorrectAttempted");
        quizCtrl.submitAttempt(
          quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
        );
        quizCtrl.feedback(
          quizCtrl.quiz.objects[quizCtrl.currentIndex],
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
        );
        $log.debug("decided");
      }
      else if(quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1){
        quizCtrl.nextQuestion();
      }
      else {
        // final question -> go to summary
        $state.go('quiz.summary',{report : angular.copy(quizCtrl.report)});
      }
    }

    function canSubmit(){

      // SCQ | DR
      if((quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.is_multiple) || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "dr question"){
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if(quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.is_multiple){
        //removes false keys
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted, _.identity);
        // true if attempted and key count is more than one
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted)>1;
      }
      if(quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence ordering" || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence structuring"){
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted.length ? true : false;
      }
    }

    function feedback (question,attempt){

      return quizCtrl.isCorrect(question,attempt) ?   $scope.openModal('correct') : $scope.openModal('wrong') ;
    }

    function submitAttempt (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
    }

    function isAttempted (question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }

    function isCorrect(question,attempt){

      // multiple choice
      if(question.node.type.type=='choicequestion' && question.node.type.is_multiple){
        return _.chain(attempt).map(function(num,key){return parseInt(key);}).isEqual(question.node.type.answer).value();
      }
      // single choice
      if(question.node.type.type=='choicequestion' && !question.node.type.is_multiple){
        return attempt == question.node.type.answer[0];
      }
      // dr
      if(question.node.type.type=='dr question'){
        return attempt == question.node.type.answer[0];
      }
      // sor | sst
      if(question.node.type.type=='sentence ordering' || question.node.type.type=='sentence structuring'){
        return angular.equals(question.node.type.answer,attempt);
      }
    }

    function isCorrectAttempted (question){
      // multiple choice

      if(question.node.type.type=='choicequestion' && question.node.type.content.is_multiple){
        for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
            if(_.chain(quizCtrl.report.attempts[question.node.id][i]).map(function(num,key){return num?parseInt(key):false;}).reject(function(num){ return !num; }).isEqual(question.node.type.answer).value())
            return true;
        }
        return false;
      }
      // single choice
      if(question.node.type.type=='choicequestion' && !question.node.type.content.is_multiple){
        return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0])!=-1 ?(true) : false;
      }
      // to be tested for new api
      // dr
      //if(question.node.type.type=='dr question'){
      //  return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0].toLowerCase())!=-1 ? true : false;
      //}
      //if(question.node.type.type=='sentence ordering' || question.node.type.type=='sentence structuring'){
      //  for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
      //    if(angular.equals(quizCtrl.report.attempts[question.node.id][i],question.node.type.answer))
      //      return true;
      //  }
      //  return false;
      //}
    }

    function isKeyCorrect (question,key){

      return question.node.type.answer.indexOf(key)!=-1 ? true : false;
    }

    function isKeyAttempted (question,key){

      if(question.node.type.is_multiple){
        return _.chain(quizCtrl.report.attempts[question.node.id]).last().has(key).value();
      }
      else{
        return quizCtrl.report.attempts[question.node.id].indexOf(key)!=-1 ? true : false;
      }
    }

    function playAudio(key){
      angular.element("#audioplayer")[0].pause();
      if(key)
      {
      angular.element("#audioSource")[0].src = key;
      }
      else{
        angular.element("#audioSource")[0].src = 'sound/water-drop.mp3';
      }
      angular.element("#audioplayer")[0].load();
      angular.element("#audioplayer")[0].play();
    }


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/quiz.feedback' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function()
    {
      $scope.modal.show();
      return true;
    };
     $scope.closeModal = function()
    {
      $scope.modal.hide();
    }

  }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-quiz')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('quiz',{
        url : '/quiz/:id',
        abstract : true,
        cache: false,
        template : '<ion-nav-view name="state-quiz"></ion-nav-view>',
        resolve: {
            quiz: ['$stateParams', 'Rest', function($stateParams, Rest) {
                return Rest.one('accounts',CONSTANT.CLIENTID.ELL).one('assessments',$stateParams.id).get().then(function(quiz){
                  return quiz.plain();
                });
            }]
        }
      })
      .state('quiz.start',{
        url : '/start',
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.start'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions',{
        url : '/questions',
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.summary',{
        url : '/summary',
        params: {
          report: null
        },
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.summary'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
  }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      // parent state after authentication
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view name="state-user"></ion-nav-view>',
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.personalise.social',{
        url : '/social',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.social'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/main'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.main.profile',{
        url : '/profile',
        nativeTransitions: {
          "type": "slide",
          "direction" : "right",
          // "duration" :  200
        },
        views : {
          'profile-tab' : {
            templateUrl : CONSTANT.PATH.PROFILE+'/profile'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main.settings',{
        url : '/settings',
        views : {
          'profile-tab' : {
            templateUrl : CONSTANT.PATH.PROFILE+'/profile.settings'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main.result',{
        url : '/result',
        nativeTransitions : null,
        views : {
          'result-tab':{
            templateUrl : CONSTANT.PATH.RESULT+'/result'+CONSTANT.VIEW
          }
        }
      })
  }
})();
