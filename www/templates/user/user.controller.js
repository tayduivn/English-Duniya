(function() {
  'use strict';

  angular
    .module('zaya-user')
    .controller('userController', userController);

  userController.$inject = [
            'CONSTANT',
            '$scope',
            '$state',
            'Auth',
            'Rest',
            '$log',
            '$ionicPopup',
            '$ionicPlatform',
            '$ionicLoading',
            '$ionicModal',
            'formHelper',
            'network',
            'data',
            '$ionicSlideBoxDelegate',
            '$timeout'
          ];

  function userController(
            CONSTANT,
            $scope,
            $state,
            Auth,
            Rest,
            $log,
            $ionicPopup,
            $ionicPlatform,
            $ionicLoading,
            $ionicModal,
            formHelper,
            network,
            dataService,
            $ionicSlideBoxDelegate,
            $timeout
              ) {
    var userCtrl = this;
    userCtrl.calcAge = calcAge;
    userCtrl.closeKeyboard = closeKeyboard;
    userCtrl.createProfile = createProfile;
    userCtrl.validatePersonaliseForm = validatePersonaliseForm;
    userCtrl.showError = showError;
    userCtrl.convertDate = convertDate;
    userCtrl.tabIndex = 0;
    userCtrl.personaliseFormValidations = $state.current.data.personaliseFormValidations || {};
    userCtrl.skills = $state.current.data.skills;
    userCtrl.network = network;
    userCtrl.goToMap = goToMap;
    userCtrl.splitName = splitName;
    userCtrl.nextSlide = nextSlide;
    userCtrl.disableSwipe = disableSwipe;
    userCtrl.playAudio = playAudio;

    userCtrl.playAudio(-1);
    $timeout(function(){
        userCtrl.playAudio(0);
    },5000);
    function playAudio(index) {
        var src;
        if(index == -1){
            src = 'sound/voice_welcome.mp3'
        }
        if(index == 0){
            src = 'sound/voice_name.mp3'
        }
        if(index == 1){
            src = 'sound/voice_gender.mp3'
        }
        if(index == 2){
            src = 'sound/voice_class.mp3'
        }

      angular.element("#audioplayer")[0].pause();
      if (src) {
        angular.element("#audioSource")[0].src = src;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
      }
    }

    function splitName(){
        userCtrl.user.first_name = userCtrl.user.name.substr(0, userCtrl.user.name.indexOf(" ") > 0?userCtrl.user.name.indexOf(" "):userCtrl.user.name.length);
        userCtrl.user.last_name = userCtrl.user.name.substr(userCtrl.user.name.indexOf(" ") > 0?userCtrl.user.name.indexOf(" ")+1:userCtrl.user.name.length,userCtrl.user.name.length);
        $log.debug("Fist ",userCtrl.user.first_name, "Last",userCtrl.user.last_name);
    }

    function disableSwipe(){
        $ionicSlideBoxDelegate.enableSlide(false);
    }

    function nextSlide() {
        $ionicSlideBoxDelegate.$getByHandle('slide').next();
    }

    function goToMap() {
      $ionicLoading.show({
        hideOnStateChange: true
      })
      $state.go('map.navigate', {})
    }

    function calcAge(dateString) {
      var birthday = +new Date(dateString);
      return ~~((Date.now() - birthday) / (31557600000));
    }

    $ionicPlatform.registerBackButtonAction(function(event) {
      event.preventDefault();
    }, 100);

    function convertDate(date) {
      function pad(s) {
        return (s < 10) ? '0' + s : s;
      }
      var d = new Date(date);
      $log.debug([d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-'))
      return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
    }


    function openSettings() {
      $scope.settings.show();
    }

    function closeSettings() {
      $scope.settings.hide();
    }

    function createProfile(formData) {
      $log.debug(formData)
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
    //   formHelper.validateForm(formData, userCtrl.personaliseFormValidations)
    //     .then(function(data) {
    //       return Rest.all('profiles').post(data);
    //     })
        userCtrl.splitName();
        delete formData['name'];

        Rest.all('profiles').post(formData)
        .then(function(response) {
          return Auth.getUser();
        })
        .then(function(response) {
          return Auth.getProfile();
        })
        .then(function(){
            return dataService.putUserifNotExist({
                'userId': Auth.getProfileId()
            })
        })
        .then(function(){
          return dataService.createIfNotExistsLessonDB()

        })
        .then(function() {
        localStorage.setItem('demo_flag',1);
          $state.go('map.navigate', {});
        })
        .catch(function(error) {
          userCtrl.showError('Could not make your profile', error || 'Please try again');
          $ionicLoading.hide();
        })


    }

    function updateProfile(userdata) {
      // body...
    }

    function logout(type) {
      userCtrl.closeSettings();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      $log.debug("USer logout",type)
      if (type == 'clean') {
        Auth.clean(function() {
          $state.go('auth.signup', {})
        })
      } else {
        Auth.logout(function() {
          $state.go('auth.signup', {})
        }, function() {
          // body...
        })
      }
    }

    function showError(title, msg) {
      $log.debug(title, msg);
      $ionicPopup.alert({
        title: title,
        template: msg
      });
    }

    function showAlert(title, msg) {
      var d = $q.defer();
      $log.debug(title, msg);
      $ionicPopup.alert({
        title: title,
        template: msg
      }).then(function(response) {
        d.resolve(response)
      }, function(error) {
        d.reject(error)
      });

      return d.promise;
    }

    function validatePersonaliseForm(formData) {
      $log.debug(formData);
      if (formData.first_name && !formData.first_name.$viewValue) {
        userCtrl.showError("Child's name", "Please enter child's name");
        return false;
      }
      if (formData.dob && !formData.dob.$viewValue) {
        userCtrl.showError("DOB", "Please select a DOB");
        return false;
      }
      if (formData.gender && !formData.gender.$viewValue) {
        userCtrl.showError("Gender", "Please select a gender");
        return false;
      }
      if (formData.gender && !formData.gender.$viewValue) {
        userCtrl.showError("Grade", "Please select a grade");
        return false;
      }
      return true;
    }

    function closeKeyboard() {
      try {
        cordova.plugins.Keyboard.close();
      } catch (e) {
        $log.debug(e);
      }
    }

    $scope.$watch("userCtrl.user.name",function(){
      try {
          userCtrl.user.name = userCtrl.user.name.replace(/  +/g, ' ');
          $log.debug("Change");
      }
      catch(err) {
        $log.debug("User Control Name not found");
      }
    });


    // function createProfile(formData) {
    //   $log.debug(formData)
    //   $ionicLoading.show({
    //     noBackdrop: false,
    //     hideOnStateChange: true
    //   });
    //   formHelper.validateForm(formData, userCtrl.personaliseFormValidations)
    //     .then(function(data) {
    //       return Rest.all('profiles').post(data);
    //     })
    //     .then(function(response) {
    //       return Auth.getUser();
    //     })
    //     .then(function(response) {
    //       return Auth.getProfile();
    //     })
    //     .then(function() {
    //       return dataService.putUserifNotExist({
    //         'userId': Auth.getProfileId()
    //       })
    //     })
    //     .then(function() {
    //       $state.go('map.navigate', {});
    //     })
    //     .catch(function(error) {
    //       $ionicPopup.alert({
    //         title: 'Could not make your profile',
    //         template: error || 'Please try again'
    //       });
    //       $ionicLoading.hide();
    //     })
    // }
  }
})();
