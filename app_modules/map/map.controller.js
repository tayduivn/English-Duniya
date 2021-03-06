/**
 * @ngdoc controller
 * @name map.controller:mapController
 * @function
 *
 * @description
 * Controller takes care of the navigation map.
 * Note: The controller gets called before map.main.js
 */
(function() {
  'use strict';
  angular
    .module('zaya-map')
    .controller('mapController', mapController);
  mapController.$inject = [
    '$scope',
    '$rootScope',
    '$log',
    '$ionicPopup',
    '$ionicModal',
    '$state',
    'lessons',
    'scores',
    'skills',
    'CONSTANT',
    '$ionicLoading',
    '$timeout',
    'orientation',
    'Auth',
    'lessonutils',
    'audio',
    'User',
    'ml',
    'lessonLocked',
    '$ionicPlatform',
    'settings',
    'mediaManager',
    '$stateParams',
    'analytics',
    '$q',
    'queue',
    'content',
    '$cordovaLocalNotification',
    'notification',
    'device',
    'multiUser',
    '$ionicSlideBoxDelegate',
    '$interval',
    'network',
    'localized',
    '$cordovaInAppBrowser',
    '$cordovaSocialSharing',
    'challenge',
    'pointsQueue'
  ];

  function mapController(
    $scope,
    $rootScope,
    $log,
    $ionicPopup,
    $ionicModal,
    $state,
    lessons,
    scores,
    skills,
    CONSTANT,
    $ionicLoading,
    $timeout,
    orientation,
    Auth,
    lessonutils,
    audio,
    User,
    ml,
    lessonLocked,
    $ionicPlatform,
    settings,
    mediaManager,
    $stateParams,
    analytics,
    $q,
    queue,
    content,
    $cordovaLocalNotification,
    notification,
    device,
    multiUser,
    $ionicSlideBoxDelegate,
    $interval,
    network,
    localized,
    $cordovaInAppBrowser,
    $cordovaSocialSharing,
    challenge,
    pointsQueue
  ) {
    lessonutils.cacheLessons();
    $log.debug(new Date().toTimeString(), "debug-optimize", "inside map controller")
    $scope.audio = audio;
    $scope.settings = settings;
    var temp = JSON.parse(localStorage.getItem('profile')).data.profile;
    temp.name = temp.first_name + ' ' + temp.last_name;
    $scope.settings.user = temp
    $scope.multiUser = multiUser;
    $scope.user = User;
    multiUser.getProfiles();
    $scope.orientation = orientation;
    $scope.activatedLesson = $stateParams.activatedLesson;
    $scope.progress = localStorage.getItem('progress');
    var mapCtrl = this;
    $scope.gender = User.getActiveProfileSync() ? User.getActiveProfileSync().data.profile.gender : 'M'
    mapCtrl.gender = JSON.parse(localStorage.getItem('profile')).data.profile.gender;
    mapCtrl.rootScope = $rootScope;
    $log.debug("map ctrl scope", $scope.mediaSyncStatus)
    var lessonList = CONSTANT.LOCK ? lessonLocked.lockedLesson : lessons;
    mapCtrl.totalStars = CONSTANT.LOCK ? lessonLocked.total_star : 0;
    $log.debug("Stars", mapCtrl.totalStars)
      // $state.current.data && lessonList.unshift($state.current.data.litmus);
    mapCtrl.User = User;
    mapCtrl.demo = User.demo;
    mapCtrl.challenge = challenge
      // mapCtrl.loading = $ionicLoading;
    mapCtrl.loading = 0;
    mapCtrl.authFactory = Auth;
    mapCtrl.queue = queue;
    mapCtrl.lessons = lessonList;
    mapCtrl.content = content;
    $log.debug("mapCtrl lessons", lessonList);
    mapCtrl.ml = ml;
    // mapCtrl.userCtrl = $controller('userCtrl');
    // mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.skillSet = skills;
    mapCtrl.updateProfile = updateProfile;
    mapCtrl.animationExpand = {};
    mapCtrl.animationExpand['expand'] = expand;
    mapCtrl.animationExpand['shrink'] = shrink;
    mapCtrl.showResult = true;
    mapCtrl.getNodeProperty = getNodeProperty;
    mapCtrl.animateStar = {
      "activeFlag": -1,
      // "resetFlag" : -1
    };
    mapCtrl.animateStar["resetColor"] = resetColor;
    // ;
    mapCtrl.setAnimateStarFlag = setAnimateStarFlag;
    mapCtrl.emitNode = emitNode;
    // port node
    mapCtrl.first_node_index = parseInt(localStorage.first_node_index) || 0;
    mapCtrl.last_node_index = parseInt(localStorage.last_node_index) || mapCtrl.lessons.length - 1;
    $log.debug("LLL", parseInt(localStorage.last_node_index) || mapCtrl.lessons.length - 1)
    mapCtrl.nodeColors = {
      "vocabulary": "blue",
      "grammar": "green",
      "listening": "darkblue",
      "reading": "orange"
    }
    mapCtrl.goToChallenge = goToChallenge;
    mapCtrl.goToChooseProfile = goToChooseProfile;
    mapCtrl.onBackButtonPress = onBackButtonPress;
    mapCtrl.share = share;
    mapCtrl.pushPointsQueue = pushPointsQueue;
    mapCtrl.syncPointsQueue = syncPointsQueue;
    mapCtrl.syncPointsQueue2 = syncPointsQueue2;
    mapCtrl.openChallenge = openChallenge;
    mapCtrl.isUserEligibleForChallenge = challenge.isUserEligible();
    mapCtrl.hasJoinedChallenge = User.hasJoinedChallenge();
    mapCtrl.isChallengeActive = challenge.isChallengeActive();
    mapCtrl.showChallengeButton = challenge.showChallengeButton();
    $scope.exitChooseProfile = exitChooseProfile;
    $scope.onProfileCardClick = onProfileCardClick;
    $scope.isOnline = network.isOnline();
    $scope.$on('$cordovaNetwork:online', function(event, networkState) {
      $scope.isOnline = network.isOnline();
    })
    $scope.$on('$cordovaNetwork:offline', function(event, networkState) {
      $scope.isOnline = network.isOnline();
    })
    $scope.changeNumberFlag = User.user.getPhoneNumber();
    $scope.currentState = $state.current.name;
    $scope.userDetails = User.user.getDetails();
    $scope.notifyPhone = User.user.getNotifyPhone();
    mapCtrl.challengeButtonDisabled = false;
    // $scope.goToPhoneNumber = goToPhoneNumber;
    // $scope.exitPhoneNumber = exitPhoneNumber;
    // mapCtrl.notification = notification;
    $log.error('ThiS is notify phone', User.user.getNotifyPhone());
    
    $scope.goToPhoneNumber = goToPhoneNumber;

    function goToPhoneNumber(){
      if ($scope.profileScreen.isShown()) {
          $scope.profileScreen.hide()
      }
      $state.go('user.phoneNumber');
    }

    $scope.exitModal = {
        message: 'Do you want to leave the game?',
        dismiss: exitModalDismiss,
        confirm: exitModalConfirm,
        leftIcon: 'sbtn-play'
      }
      // notification.offline.list()
    notification.offline.list().then(function(schedulerObjectArray) {
      // notification.offline.scheduleMulti(schedulerObjectArray);
      $rootScope.toBeScheduled = schedulerObjectArray;
    }).catch(function(err) {
      $log.error('some error occured while fetching offline notification doc', err);
    })

    function openChallenge() {}

    function exitModalDismiss() {
      $log.debug('EXITING SURELY')
      ionic.Platform.exitApp();
    }

    function exitModalConfirm() {
      $log.debug('EXITING NOT SURELY')
      $scope.exitApp.hide().then(function() {
        analytics.log({
          name: 'APP',
          type: 'EXIT_MODAL_HIDE'
        }, {
          time: new Date()
        }, User.getActiveProfileSync()._id);
        $log.debug('You are not sure');
      });
    }
    $scope.showCreateProfileModal = function() {
      $scope.createProfileModal.show();
    }

    function createProfileModalDismiss() {
      $scope.createProfileModal.hide();
    }

    function createProfileModalConfirm() {
      $scope.profileScreen.hide();
      $scope.createProfileModal.hide();
      $scope.multiUser.goToCreateNewProfile();
    }
    // $log.debug("ISVERIFIED",$scope.phone.number.length < 10,$scope.phone.number == User.user.getPhoneNumber(), $scope.phone.isVerified)
    
    // notification.createDb();
    // notification.init();
    // notification.defineTypes();
    // notification.dbDestroy();
    // notification.smartContentSet();
    // $log.debug("DB LOADING",notification.db.load());
    // $scope.$on('pageRegion', mapCtrl.setLessonRange )
    $scope.$on('backButton', mapCtrl.onBackButtonPress)

    function onBackButtonPress() {
      $log.warn('LOADING', mapCtrl.loading)
        //UNCOMMENT THIS      
      if (mapCtrl.loading == 0) {
        if ($scope.profileScreen.isShown()) {
          exitChooseProfile()
        } else if ($scope.phoneNumberScreen.isShown()) {
          $scope.phone.exit();
        } else {
          if (!$scope.exitApp.isShown()) {
            $log.warn('Clicked on back button on map');
            $scope.exitApp.show().then(function() {
              analytics.log({
                name: 'APP',
                type: 'EXIT_MODAL_SHOW'
              }, {
                time: new Date()
              }, User.getActiveProfileSync()._id);
            });
          }
        }
      }
    }
    notification.getFromServer({
      dev_id: device.uuid
    }).then(function(response) {
      $log.debug("We got this", response)
    }, function(response) {
      $log.error("We couldn't get", response)
      if (response.status == 404) {
        $log.warn("No worries, we kust register your device")
      } else {}
    });
    $log.debug("This is the lesson list")
    $log.debug(JSON.stringify(lessonList))
    $log.debug(lessonList.length)
    $log.debug(JSON.stringify(lessonList[lessonList.length - 1]))
      // $log.debug("FETCHINGDOCBYID",notification.fetchDocById())
    notification.fetchDocById(lessonList[lessonList.length - 1].node.parent).then(function(doc) {
        $log.debug("FETCHING DOC complete", doc)
        if (lessonutils.resourceType(lessonList[lessonList.length - 1]) != 'practice') {
          $log.debug('discovered', notification.defineType(doc, 'discovered'))
        } else {
          $log.debug('undiscovered', notification.defineType(doc, 'undiscovered'))
        }
        localStorage.setItem('scheduleNotification', JSON.stringify(notification.defineType(doc, lessonutils.resourceType(lessonList[lessonList.length - 1]) != 'practice' ? 'discovered' : 'undiscovered')))
          // localStorage.setItem('offlineNotif',JSON.stringify(doc));
      })
      // $log.debug("Defining types in map",notification.defineTypes());
      // $scope.$on('nextRegion', mapCtrl.setLessonRange )
      // end : port node
      /**
       * @ngdoc property
       * @name mapCtrl.setAnimateStarFlag
       * @propertyOf map.controller:mapController
       * @description
       * Initializes animateStar flag in localStorage
       *
       */
    function setAnimateStarFlag() {
      var animateStarFlag = {
        isCurrentNode: true,
        clickedNodeStar: 0
      };
      localStorage.setItem("animateStarFlag", JSON.stringify(animateStarFlag));
    }
    /**
     * @ngdoc method
     * @name mapCtrl.getNodeProperty
     * @methodOf map.controller:mapController
     * @description
     * Finds node property values in localstorage and then returns them
     * @param {string} propertyString A string to define the property of the node. It can take the values 'x', 'y', 'width', 'height', 'node', 'type'
     * @returns {string} Value of the property stored in localStorage. If nothing is found value 0 is returned
     */
    // $log.debug("lessons HAHA",mapCtrl.lessons[lessons.length-1].node);
    function getNodeProperty(prop) {
      if (prop == 'x')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).x : 0;
      if (prop == 'y')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).y : 0;
      if (prop == 'width')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).width : 0;
      if (prop == 'height')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).height : 0;
      if (prop == 'node')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).node : 0;
      if (prop == 'type')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).type : 0;
    }
    // $ionicPlatform.registerBackButtonAction(function(event) {
    //   event.preventDefault();
    // }, 100);
    $scope.$on('removeLoader', function(showHud) {
      $ionicLoading.hide();
    });
    if (CONSTANT.CONTENT_TEST) {
      $scope.$emit('removeLoader');
      $log.debug("content test lessons", mapCtrl.lessons)
    }

    function emitNode(resource) {
      $log.debug("Opening node", resource)
      $scope.$emit('openNode', resource)
    }
    $scope.$on('openNode', function(event, node) {
      $timeout.cancel(mapCtrl.openChallengeTimeout);
      $log.debug("Opennode Triggered");
      $ionicLoading.show({
        // noBackdrop: false
        hideOnStateChange: true
      });
      mapCtrl.loading = 1;
      if ($scope.exitApp.isShown()) {
        $scope.exitApp.hide().then(function() {
          analytics.log({
            name: 'APP',
            type: 'EXIT_MODAL_HIDE'
          }, {
            time: new Date()
          }, User.getActiveProfileSync()._id);
          $log.debug('You are not sure');
        });
      }
      $scope.demo.isShown() && $scope.demo.hide();
      $scope.selectedNode = node;
      //   $scope.demo.isShown() && $scope.demo.hide();
      var promise;
      $log.debug('intro sound', node.node.intro_sound, node)
        // lessonutils.cacheLessons()
      if (node.node.intro_sound) {
        promise = mediaManager.downloadIfNotExists(node.node.intro_sound)
      } else {
        promise = $q.resolve();
      }
      promise.then(function() {
          return mediaManager.getPath(node.node.intro_sound)
        })
        .then(function(s) {
          $log.debug("Intro sound downloaded if not exist", s);
          if (s) {
            node.node.parsed_sound = s;
          }
          $log.debug(node);
          lessonutils.playResource(node);
          return content.getLesson(node.node.parent);
        })
        .then(function(lesson) {
          lessonutils.setLocalLesson(JSON.stringify(lesson))
        }).catch(function(e) {
          $ionicLoading.hide()
          $log.debug("error is here");
          $ionicPopup.alert({
            template: '<error-popup message="\'Connect to the internet to keep playing\'"></error-popup>',
            cssClass: 'custom-alert',
            okType: 'sbtn sbtn-ok',
            okText: ' '
          })
        });
      //   if (currentPos)
      //     currentPos.lessonType = node.tag;
      //
      //   if (node.content_type_name == 'litmus') {
      //     $state.go('quiz.questions', {
      //       id: node.id,
      //       type: 'litmus'
      //     });
      //   } else {
      //     $ionicLoading.show({
      //       // hideOnStateChange: true
      //     });
      //     $scope.user = User;
      //     $scope.lessonutils.getLesson(node.id, $scope).then(
      //
      //       function(response) {
      //
      //
      //         analytics.log(
      //               {
      //                   name : 'LESSON',
      //                   type : 'START',
      //                   id : node.id
      //               },
      //               {
      //                   time : new Date()
      //               },
      //               User.getActiveProfileSync()._id
      //           );
      //
      //         var promise;
      //         if(node.meta.intros && node.meta.intros.sound  && node.meta.intros.sound[0]){
      //
      //           promise = mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + node.meta.intros.sound[0])
      //         } else {
      //           promise = $q.resolve();
      //         }
      //
      //         promise.then(function(s) {
      //           if(s){
      //             node.meta.parsed_sound = s;
      //           }
      //
      //           audio.setVolume('background', 0.1);
      //         if(currentPos)
      //         {
      //
      //           mapCtrl.animationExpand.expand(currentPos,node);
      //         }else{
      //           $scope.openNodeMenu(node);
      //           $scope.selectedNode = response;
      //         }
      //         }).catch(function(error) {
      //
      //           $ionicLoading.hide();
      //           $ionicPopup.alert({
      //             title: 'Please try again',
      //             template: "No internet conection found"
      //           });
      //         });
      //       }
      //     );
      //   }
      //
    });
    $scope.$on('animateStar', function() {
      // for (var i = 0; i < mapCtrl.skillSet.length; i++) {
      //   $log.info("Loop", i, "\nskillSetTag : ", mapCtrl.skillSet[i].title.toLowerCase(), "\nactivatedLessonTag : ", $stateParams.activatedLesson.node.tag.toLowerCase())
      //   if (mapCtrl.skillSet[i].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
      //     mapCtrl.animateStar.activeFlag = i;
      //     // mapCtrl.animateStar.animateFlag = i;
      //     break;
      //   }
      // }
    });
    /**
     * @ngdoc method
     * @name mapCtrl.animateStar.resetColor
     * @methodOf map.controller:mapController
     * @description
     * Used for resetting color flag. The color flag determines whether the previous attempted lesson tag gets highlighted in the HUD.
     * @param {int} index The index of the current element in the lessons array
     * @returns {boolean} True if the flag is successfully reset else false
     *
     */
    function resetColor(index) {
      if ($stateParams.activatedLesson && mapCtrl.skillSet[index].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
        mapCtrl.animateStar.activeFlag = -2;
        return true;
        // mapCtrl.animateStar.animateFlag = -1;
      }
      return false;
    }
    $scope.openNodeMenu = function(node) {
      $log.debug("this")
      lessonutils.playDemoAudio(node);
      $scope.nodeMenu.show();
      $ionicLoading.hide();
      return true;
    };
    $scope.closeNodeMenu = function() {
      analytics.log({
          name: 'LESSON',
          type: 'END',
          id: $scope.selectedNode.node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      );
      //
      $scope.nodeMenu.hide().then(function() {
        mapCtrl.closeDemo();
      });
      return true;
    };
    /**
     * @ngdoc method
     * @name mapCtrl.openDemo
     * @methodOf map.controller:mapController
     * @description
     * starts the demo on the navigation map by triggering the demo modal.
     * @returns {boolean} True every time
     *
     */
    mapCtrl.openDemo = function() {
      $scope.demo.show().then(function() {
        $ionicLoading.hide();
      });
      return true;
    };
    /**
     * @ngdoc method
     * @name mapCtrl.closeDemo
     * @methodOf map.controller:mapController
     * @description
     * ends the demo on the navigation map by closing the demo modal.
     * @returns {boolean} True every time
     *
     */
    mapCtrl.closeDemo = function() {
      $scope.demo.hide().then(function() {
        location.reload();
      });
      return true;
    };
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-exit' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(nodeMenu) {
      $scope.exitApp = nodeMenu;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-exit' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(nodeMenu) {
      $scope.createProfileModal = nodeMenu;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(nodeMenu) {
      $scope.nodeMenu = nodeMenu;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.USER + '/user.chooseProfile' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(profileScreen) {
      $scope.profileScreen = profileScreen;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.USER + '/user.phoneNumber' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(phoneNumberScreen) {
      $scope.phoneNumberScreen = phoneNumberScreen;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.demo' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false,
      hideOnStateChange: true
    }).then(function(demo) {
      $scope.demo = demo;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.settings' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(settings) {
      $scope.settingsModal = settings;
    });
    // function openSettings() {
    //   $scope.settings.show();
    // }
    //
    // function closeSettings() {
    //   $scope.settings.hide();
    // }
    // $timeout(function(){
    //     mapCtrl.openDemo();
    // },2000)
    // function resetNode() {
    //   $timeout(function() {
    //     $scope.selectedNode = {};
    //   }, 500)
    // }
    // $timeout(function functionName() {
    //   if (mapCtrl.lessons && localStorage.lesson) {
    //     $scope.openNodeMenu();
    //     $scope.selectedNode = $scope.lessonutils.getLocalLesson();
    //   }
    // });
    // $scope.test = {"phone_number":"+919393939193"};
    // updateProfile($scope.test);
    function expand(currentPos, node) {
      // alert(JSON.stringify(e));
      mapCtrl.showResult = false;
      // $mapCtrl.animationExpand.lessonType = currentPos.lessonType
      mapCtrl.animationExpand.containerStyle = {
        "margin-left": currentPos.x - 30 + "px",
        "margin-top": currentPos.y - 30 + "px",
        "opacity": 1
      }
      $timeout(function() {
        mapCtrl.animationExpand.iconTranslateOffset = {
          "transform": "translate(" + ((screen.width / 2) - currentPos.x) + "px," + (40 - currentPos.y) + "px) scale3d(2,2,2)",
          "transition": "transform 0.5s ease-in-out"
        };
        mapCtrl.animationExpand.expandContainer = 1;
      }, 50).then(function() {
        $timeout(function() {
          $scope.openNodeMenu(node);
        });
      });
    }

    function shrink() {
      mapCtrl.showResult = true;
      mapCtrl.animationExpand.iconTranslateOffset = {
        "transform": "translate(0px,0px) scale3d(1,1,1)",
        "transition": "transform 0.4s ease-in-out"
      };
      mapCtrl.animationExpand.expandContainer = 0;
      $timeout(function() {
        mapCtrl.animationExpand.containerStyle = {
          "margin-left": "0px",
          "margin-top": "0px",
          "opacity": 0
        }
      }, 400);
    }
    $scope.$on('show_demo', function() {
      // $ionicLoading.show();
      if (User.demo.isShown() && User.demo.getStep() == '1') {
        $timeout(function() {
          $scope.demo.show().then(function() {
            $log.debug("playdemoaudio", CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.demo.startEnglish.lang[User.getActiveProfileSync().data.profile.language])
            audio.player.play(CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.demo.startEnglish.lang[User.getActiveProfileSync().data.profile.language]);
            User.demo.setStep(2)
          });
        })
      }
    });

    function updateProfile(profileData) {
      //If conflict arises. Don't delete this
      //
      //
      if (profileData.grade != JSON.parse(localStorage.profile).data.profile.grade) {
        $ionicLoading.show({
          hideOnStateChange: true
        });
        mapCtrl.loading = 1;
        localStorage.setItem("currentPosition", 4000);
        localStorage.removeItem("regionPage");
        User.profile.update(mapCtrl.User.getActiveProfileSync()._id, profileData).then(function() {
          $scope.settingsModal.hide();
          location.reload()
        });
      } else {
        $scope.settingsModal.hide();
      }
      //
      // $rootScope.$broadcast('reloadMap');
      // $state.go('map.navigate')
      // $state.reload()
    }

    function goToChooseProfile() {
      mapCtrl.openChallengeTimeout && $timeout.cancel(mapCtrl.openChallengeTimeout);
      $scope.exitModal.message = "Do you want to create<br>a new profile";
      $scope.exitModal.dismiss = createProfileModalDismiss;
      $scope.exitModal.confirm = createProfileModalConfirm;
      $scope.exitModal.leftIcon = 'sbtn-correct';
      $log.debug('$scope',$scope.exitModal)
      $log.debug("PHONE. changed number flag", $scope.changeNumberFlag);
      analytics.log({
        name: 'CHOOSEPROFILE',
        type: 'TAP',
      }, {
        time: new Date(),
      }, User.getActiveProfileSync()._id);
      multiUser.getProfiles()
      $scope.profileScreen.show().then(function() {
        analytics.log({
          name: 'CHOOSEPROFILE',
          type: 'OPEN',
        }, {
          time: new Date(),
        }, User.getActiveProfileSync()._id);
        audio.stop('background');
      });
      // analytics.log({
      // })
      //   $state.go('user.chooseProfile');
    }

    function exitChooseProfile() {
      $scope.exitModal.message = "Do you want to leave the game?";
      $scope.exitModal.dismiss = exitModalDismiss;
      $scope.exitModal.confirm = exitModalConfirm;
      $scope.exitModal.leftIcon = 'sbtn-play';
      $scope.profileScreen.hide().then(function() {
        audio.loop('background');
        analytics.log({
          name: 'CHOOSEPROFILE',
          type: 'CLOSE',
        }, {
          time: new Date(),
        }, User.getActiveProfileSync()._id);
      });
    }

    function onProfileCardClick() {
      analytics.log({
        name: 'CHOOSEPROFILE',
        type: 'PROFILE_TAP',
      }, {
        time: new Date(),
      }, User.getActiveProfileSync()._id);
    }
    // var options = {
    //   location: 'no',
    //   clearcache: 'yes',
    //   toolbar: 'no',
    //   zoom: 'no',
    //   hardwareback: 'no',
    //   hidden: 'yes'
    // };
    var options = 'location=no,hidden=yes,toolbar=no';
    console.log("http://192.168.10.234:8062")
      // window.location.href='http://192.168.10.234:8062';
    var inAppBrowserRef;

    function share() {
      var shareoptions = {
        message: 'share this', // not supported on some apps (Facebook, Instagram)
        subject: 'the subject', // fi. for email
        // files: ['', ''], // an array of filenames either locally or remotely
        url: 'https://www.website.com/foo/#bar?a=b'
          // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      }
      var onSuccess = function(result) {
        $log.debug("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        $log.debug("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      }
      var onError = function(msg) {
        $log.debug("Sharing failed with message: " + msg);
      }
      $log.debug("share", shareoptions, onSuccess, onError);
      window.plugins.socialsharing.shareWithOptions(shareoptions, onSuccess, onError);
    }

    function goToChallenge() {
      mapCtrl.challengeButtonDisabled = true;
      analytics.log({
        name: 'CHALLENGE',
        type: 'CLICKED'
      }, {
        time: new Date()
      }, User.getActiveProfileSync()._id);
      if (network.isOnline()) {
        if (User.hasJoinedChallenge()) {
          $ionicLoading.show({
            hideOnStateChange: true
          })
          mapCtrl.loading = 1;
          challenge.postPoints().then(function() {
            $log.debug("syncPointsQueue success")
            $state.go('weekly-challenge', {
              profileId: User.getActiveProfileSync()._id
            })
          }).catch(function(){
            $ionicLoading.hide();
            mapCtrl.challengeButtonDisabled = false;
             $ionicPopup.alert({
              // title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
              template: '<error-popup message="\'Please try again\'"></error-popup>',
              cssClass: 'custom-alert',
              okType: 'sbtn sbtn-ok',
              okText: ' '
            })
          })
        } else {
            mapCtrl.challengeButtonDisabled = false;
          $scope.challengeModal.show().then(function(){
            audio.player.play('sound/challenge_starting_now.mp3');
          })
        }
      } else {
            mapCtrl.challengeButtonDisabled = false;
        audio.player.play('sound/challenge_starting_now_offline.mp3');
        var noInternetChallengeAlert = 
            $ionicPopup.alert({
              // title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
              template: '<error-popup message="\'Connect to the internet to keep playing\'"></error-popup>',
              cssClass: 'custom-alert',
              okType: 'sbtn sbtn-ok',
              okText: ' '
            })
        noInternetChallengeAlert.then(function() {
          audio.player.stop();
        })
      }
    }

    function pushPointsQueue() {
      $log.debug("pushPointsQueue")
      pointsQueue.push({
        client_id: User.getActiveProfileSync()._id,
        points: [{
          action: 'quiz_complete',
          score: 500
        }]
      }).then(function() {
        $log.debug("pushPointsQueue success")
      })
    }

    function syncPointsQueue() {
      // $log.debug("syncPointsQueue",pointsQueue.startSync())
      pointsQueue.startSync().then(function() {
        $log.debug("syncPointsQueue success")
      });
    }

    function syncPointsQueue2() {
      // $log.debug("syncPointsQueue",pointsQueue.startSync())
      pointsQueue.startSync().then(function() {
        $log.debug("syncPointsQueue success2")
      });
    }
    $log.debug("challenge demo step is", User.demo.getStep())
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-challenge' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(challengeModal) {
      $log.debug("challenge modal defined", User.hasJoinedChallenge())
      $scope.challengeModal = challengeModal;
      $log.debug(User.demo.getStep() != 1 ,!User.hasJoinedChallenge() , challenge.isUserEligible() , $rootScope.showChallengeModal , challenge.isChallengeActive())
      if (User.demo.getStep() != 1 && !User.hasJoinedChallenge() && challenge.isUserEligible() && $rootScope.showChallengeModal && challenge.isChallengeActive()) {
        $log.debug("showing challenge modal")
        mapCtrl.openChallengeTimeout = $timeout(function() {
            $scope.challengeModal.show().then(function() {
            audio.player.play('sound/challenge_starting_now.mp3');
              $rootScope.showChallengeModal = false;
            });
        }, 4000)
      }
    });
    $scope.joinChallenge = function() {
      $log.debug("join challenege");
      if (User.user.getPhoneNumber()) {
        User.joinChallenge();
        analytics.log({
          name: 'CHALLENGE',
          type: 'JOINED'
        }, {
          time: new Date()
        }, User.getActiveProfileSync()._id);
        $scope.challengeModal.hide().then(function() {
          goToChallenge()
        });
        $log.debug("Succesfully joined the challenge")
      } else {
        $scope.challengeModal.hide().then(function() {
          goToPhoneNumber();
        })
      }
    }

    $scope.goToChallenge = function(){
      
    }

    $scope.dismissJoinChallenge = function() {
      $log.debug("dismiss join challenege");
      audio.player.stop();
      $scope.challengeModal.hide().then(function() {
        $log.debug("challenge modal hiden")
          // goToChallenge();
      });
    }

    function daysBetween(date1, date2) {
      //Get 1 day in milliseconds
      var one_day = 1000 * 60 * 60 * 24;
      // Convert both dates to milliseconds
      var date1_ms = date1.getTime();
      var date2_ms = date2.getTime();
      // Calculate the difference in milliseconds
      var difference_ms = date2_ms - date1_ms;
      // Convert back to days and return
      return Math.round(difference_ms / one_day);
    }
    //Set the two dates
    var challengeStartDate = new Date(CONSTANT.CHALLENGE_START.YEAR, CONSTANT.CHALLENGE_START.MONTH, CONSTANT.CHALLENGE_START.DATE);
    var challengeStartDateText = new Date(challengeStartDate.getFullYear(), challengeStartDate.getMonth(), challengeStartDate.getDate());
    var today = new Date();
    var todayText = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    //displays 726
    mapCtrl.daysRemaining = daysBetween(todayText, challengeStartDateText) > 0 ? daysBetween(todayText, challengeStartDateText) : 0;
  }
})();