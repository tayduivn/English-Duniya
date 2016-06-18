(function() {
  'use strict';

  angular
    .module('common')
    .factory('data', data);

  data.$inject = ['pouchDB', '$http', '$log', 'Rest', 'CONSTANT', '$q', '$ImageCacheFactory', 'mediaManager'];

  /* @ngInject */
  function data(pouchDB, $http, $log, Rest, CONSTANT, $q, $ImageCacheFactory, mediaManager) {
    // var diagnosisQuestionsDB = pouchDB('diagnosisQuestions');
    // var kmapsDB = pouchDB('kmaps');

    var diagLitmusMappingDB = pouchDB('diagLitmusMapping');
    var kmapsJSONDB = pouchDB('kmapsJSON');
    var dqJSONDB = pouchDB('dqJSON');
    var lessonDB = pouchDB('lessonDB');
    var appDB = pouchDB('appDB');
    var resourceDB = pouchDB('resourceDB');

    var getDataSource = function() {

    };

    function preloadMedia(resource) {
      var d = $q.defer();
      if (resource.node.content_type_name === 'assignment') {
        $q.all([preloadImages(resource),
          preloadSounds(resource)
        ]).then(function(success) {
          d.resolve(success);
        }, function(error) {
          d.reject(error)
        });
      } else if (resource.node.content_type_name === 'resource') {
        $log.debug("resource", resource)
        $q.all(preloadVideo([resource.node.type.path])).then(function(success) {
          d.resolve(success);
        }, function(error) {
          d.reject(error);
        })
      }
      return d.promise;
    }


    function preloadImages(quiz) {
      var d = $q.defer();
      var images = [];
      angular.forEach(quiz.objects, function(question) {
        angular.forEach(question.node.type.content.widgets.images, function(image) {
          images.push(CONSTANT.RESOURCE_SERVER + image);
        })
      })
      $ImageCacheFactory.Cache(images).then(function() {
        d.resolve('Images Loaded Successfully');
      }, function(failed) {
        d.reject('Error Loading Image' + failed);
      });
      return d.promise;
    }

    function preloadSounds(quiz) {
      var d = $q.defer();
      ionic.Platform.ready(function() {
        var promises = [];
        angular.forEach(quiz.objects, function(question) {
          angular.forEach(question.node.type.content.widgets.sounds, function(sound) {
            try {
              promises.push(mediaManager.downloadSound(CONSTANT.RESOURCE_SERVER + sound));
            } catch (e) {
              $log.debug("Error Downloading sound")
            }
          })
        });
        $q.all(promises).then(function(success) {
          d.resolve("Sounds Loaded Successfully");
        });
        return d.promise;
      });
    }

    function preloadVideo(pathArray) {
      var d = $q.defer();
      ionic.Platform.ready(function() {
        var promises = [];
        angular.forEach(pathArray, function(path) {
          try {
            $log.debug(mediaManager)
            promises.push(mediaManager.downloadVideo(CONSTANT.RESOURCE_SERVER + path));
          } catch (e) {
            $log.debug("Error Downloading video", e)
          }
        })
        $q.all(promises).then(function(success) {
          d.resolve("Videos Loaded Successfully");
        });
        return d.promise;
      });
    }
    var data = {
      // createDiagnosisQuestionDB: createDiagnosisQuestionDB(),
      // createKmapsDB: createKmapsDB(),
      createDiagLitmusMappingDB: createDiagLitmusMappingDB(),
      createKmapsJSON: createKmapsJSON(),
      createDiagQJSON: createDiagQJSON(),
      createLessonDB: createLessonDB,
      // getDiagnosisQuestionById: getDiagnosisQuestionById,
      // getDiagnosisQuestionByLevelNSkill: getDiagnosisQuestionByLevelNSkill,
      getDiagnosisLitmusMapping: getDiagnosisLitmusMapping,
      getTestParams: getTestParams,
      // getFromKmapsBySr: getFromKmapsBySr,
      getKmapsJSON: getKmapsJSON,
      getDQJSON: getDQJSON,
      // diagnosisQuestionsDB: diagnosisQuestionsDB,
      // kmapsDB: kmapsDB,
      // diagLitmusMappingDB: diagLitmusMappingDB
      getQuizScore: getQuizScore,
      getLessonScore: getLessonScore,
      getLessonsScore: getLessonsScore,
      getLessonsList: getLessonsList,
      getAssessment: getAssessment,
      saveReport: saveReport,
      saveAttempts: saveAttempts,
      // getResults : getResults, // for results in hud screen
      downloadLesson: downloadLesson,
      getLesson: getLesson,
      updateLesson: updateLesson,
      isLessonDownloaded: isLessonDownloaded,
      updateScore: updateScore,
      // addNewUser: addNewUser
      putUserifNotExist: putUserifNotExist
    };


    return data;

    function getTestParams(realTimeGrade) {

      function setPreviousAnswerCallback(tests, x) {
        tests["previousAnswer"] = x[0];
        tests["count"]++;
        console.log('tests', JSON.stringify(tests));
        if (x[0] == 1) {
          x[1].test[0]["qSet"][x[1]["actualLevel"]] = {
            "sr": x[1].qSr,
            "answered": "right"
          };
        } else {
          x[1].test[0]["qSet"][x[1]["actualLevel"]] = {
            "sr": x[1].qSr,
            "answered": "wrong"
          };
        }
      }

      return [{
        "skill": "vocabulary",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }, {
        "skill": "reading",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }, {
        "skill": "grammar",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }, {
        "skill": "listening",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }];
    }

    // function createDiagnosisQuestionDB() {
    //     $http.get('templates/common/questions.json').success(function(data) {
    //         $log.debug('in createDiagnosisQuestionDB');
    //         diagnosisQuestionsDB.bulkDocs(data);
    //     });
    // };

    // function createKmapsDB() {
    //     $http.get('templates/common/kmaps.json').success(function(data) {
    //         $log.debug('in createKmapsDB');
    //         kmapsDB.bulkDocs(data);
    //     });
    // };


    function createDiagLitmusMappingDB() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosticLitmusMapping.json').success(function(data) {
        $log.debug('in createDiagLitmusMappingDB');
        return diagLitmusMappingDB.put({
            "_id": "diagnostic_litmus_mapping",
            "diagnostic_litmus_mapping": data[0]
          })
          .then(function() {
            $log.debug('createDiagLitmusMappingDB success');
          })
          .catch(function(err) {
            $log.debug('err createDiagLitmusMappingDB', err)
          });
      });
      // $log.debug('promise of createDiagLitmusMappingDB', promise);
      return promise;
    };

    function createKmapsJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/kmapsJSON.json').success(function(data) {
        $log.debug('in createKmapsJSON');
        return kmapsJSONDB.put({
            "_id": "kmapsJSON",
            "kmapsJSON": data[0]
          })
          .then(function() {
            $log.debug('kmapsJSON success');
          })
          .catch(function(err) {
            $log.debug('err kmapsJSON', err)
          });
      });
      // $log.debug('promise of createKmapsJSON', promise);
      return promise;
    };

    function createDiagQJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosisQJSON.json').success(function(data) {
        $log.debug('in createDiagQJSON');
        return dqJSONDB.put({
            "_id": "dqJSON",
            "dqJSON": data[0]
          })
          .then(function() {
            $log.debug('dqJSONDBdqJSONDB success');
          })
          .catch(function(err) {
            $log.debug('err dqJSONDB', err)
          });
      });
      // $log.debug('promise of createDiagQJSON', promise);
      return promise;
    }

    function getDQJSON() {
      var result = dqJSONDB.get("dqJSON")
        .then(function(doc) {
          return doc.dqJSON;
        })
      return result;
    }

    function getKmapsJSON() {
      var result = kmapsJSONDB.get("kmapsJSON")
        .then(function(doc) {
          return doc.kmapsJSON;
        })
      return result;
    }

    function getDiagnosisLitmusMapping() {
      var result = diagLitmusMappingDB.get("diagnostic_litmus_mapping")
        .then(function(doc) {
          return doc.diagnostic_litmus_mapping;
        })
      return result;
    }

    function createLessonDB() {
      var d = $q.defer();
      var promises = []
      return $http.get('templates/common/lessons.json').success(function(data) {
        $log.debug('in createLessonDB', data);
        for (var i = 0; i < data.length; i++) {
          data[i].key = i;
          promises.push(lessonDB.put({
            "_id": data[i].node.id,
            "lesson": data[i],


          }));
        }
        $q.all(promises).then(function() {
          d.resolve("Lesson Db created");
        })
        return d.promise;
      });
      // $log.debug('promise of createKmapsJSON', promise);

    }

    function putUserifNotExist(data) {
      $log.debug("putUserifNotExist");
      return appDB.get(data.userId).then(function() {
        return true;
      }).catch(function() {
        return appDB.put({
          '_id': data.userId,
          'data': {
            'scores': {}
          }
        }).then(function() {
          return true;
        });
      })

      return appDB.put({
        "_id": data.userId,
        "scores": {}
      });
    }

    function updateScore(data) {
      return appDB.get(data.userId).then(function(response) {
        var doc = response.data;
        if (!doc.scores.hasOwnProperty(data.lessonId)) {
          doc.scores[data.lessonId] = {};
        }
        doc.scores[data.lessonId][data.id] = {
          'score': data.score,
          'totalScore': data.totalScore
        };
        return appDB.put({
          '_id': data.userId,
          '_rev': response._rev,
          'data': doc
        }).catch(function(e) {});
      }).catch(function(e) {})

    }

    function getLessonScore(data) {
      return appDB.get(data.userId).then(function(response) {
        return response.data.scores[data.lessonId];
      })
    }

    function getQuizScore(data) {
      var d = $q.defer();
      appDB.get(data.userId).then(function(response) {
        var result = null;
        if (response.data.scores.hasOwnProperty(data.lessonId)) {
          if (response.data.scores[data.lessonId].hasOwnProperty(data.id)) {
            result = (response.data.scores[data.lessonId][data.id])
          }
        }
        d.resolve(result);
      }).catch(function(e) {
        d.reject();
      })
      return d.promise;
    }

    function getLessonsScore(limit) {
      return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('profiles', JSON.parse(localStorage.user_details).profile).customGET('lessons-score', {
        limit: limit
      }).then(function(score) {
        $log.debug('scores rest', score.plain());
        return score.plain().results;
      }, function(error) {
        $log.debug('some error occured', error);
      })
    }

    function getLessonsList(limit) {
      var d = $q.defer();
      lessonDB.allDocs({
          include_docs: true
        }).then(function(data) {
          $log.debug("ALl lessons",data)
          var lessons = [];
          for (var i = 0; i < data.rows.length; i++) {
            data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key
            lessons.push(data.rows[i].doc.lesson.node);
          }
            lessons = _.sortBy(lessons, 'key');
            $log.debug(lessons)
          d.resolve(lessons)
        })
        .catch(function(error) {
          d.reject(error)
        })
      return d.promise;
      // return Rest.one('accounts', CONSTANT.CLIENTID.ELL).customGET('lessons', {
      //   limit: limit
      // }).then(function(lessons) {
      //   return lessons.plain().results;
      // }, function(error) {
      //   $log.debug('some error occured', error);
      // })
    }

    function getAssessment(assessmentId) {


      return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('assessments', assessmentId).get().then(function(quiz) {
        return quiz.plain();
      });
    }

    function saveAttempts(data) {
      return;
      return Rest.all('attempts').post(data);
    }

    function saveReport(data) {
      return;
      return Rest.all('reports').post(data);
    }

    function downloadQuiz(id) {}

    function getLesson(id) {
      var d = $q.defer();
      lessonDB.get(id).then(function(data) {
        d.resolve(data.lesson)
      }).catch(function(error) {
        d.reject(error)
      })
      return d.promise;
    }

    function updateLesson(lesson) {
      $log.debug("Recieved", lesson)
      lessonDB.get(lesson.node.id).then(function(doc) {
        $log.debug(doc)
        return lessonDB.put({
          _id: lesson.node.id,
          _rev: doc._rev,
          lesson: lesson
        });
      });
    }

    function downloadLesson(id, mediaTypes) {
      $log.debug("insid downloadLesson", id,mediaTypes)
      var d = $q.defer();
      var promises = [];
      data.getLesson(id).then(function(response) {
        angular.forEach(response.media, function(file) {
          if (!mediaTypes || (mediaTypes.length > 0 && mediaTypes.indexOf(file.url.split('.').pop()) >= 0)) {
            try {
              promises.push(
                mediaManager.download(CONSTANT.RESOURCE_SERVER + file.url).then(function() {
                  file.downloaded = true;
                })

              );
            } catch (e) {
              $log.debug("Error Downloading")
            }
          }
        })
        $q.all(promises).then(function(success) {
            return data.updateLesson(response);
          }).then(function(data) {
            d.resolve(data);
          })
          .catch(function(err) {
            $log.debug(err)
          });
      })

      return d.promise;
      //
      // return;
      // return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get()
      //   .then(function(response) {
      //     lesson = response.plain();
      //     $log.debug('lesson');
      //     return lessonDB.put({
      //       '_id': id,
      //       'lesson': lesson
      //     })
      //   })
      //   .then(function(response) {
      //     var d = $q.defer();
      //     var promises = [];
      //     var index = null;
      //     angular.forEach(lesson.objects, function(object, key) {
      //       promises.push(preloadMedia(object));
      //       if (object.node.content_type_name === 'assessment') {
      //         $log.debug("assessment");
      //         promises.push(quizDB.put({
      //           '_id': object.node.id,
      //           'quiz': object
      //         }));
      //       }
      //       if (object.node.content_type_name === 'resource') {
      //         $log.debug("resource");
      //         promises.push(resourceDB.put({
      //           '_id': object.node.id,
      //           'resource': object
      //         }));
      //       }
      //     })
      //     $q.all(promises).then(function(success) {
      //       d.resolve("Resources Loaded Successfully");
      //     });
      //     return d.promise;
      //   })
      //   .then(function(data) {
      //     $log.debug(data);
      //   })
      //   .catch(function(response) {
      //     $log.debug("err", response)
      //   })
    }
    function isLessonDownloaded(id,mediaTypes) {

          var d = $q.defer();
          lessonDB.get(id).then(function(data) {
              var downloaded = true;
              for (var i = 0; i < data.lesson.media.length; i++) {
                if ((!mediaTypes || mediaTypes.length > 0 || mediaTypes.indexOf(file.url.split('.').pop()) >= 0) && data.lesson.media[i].downloaded === false) {
                  downloaded = false;
                  break;
                }
              }
              d.resolve(downloaded);
            })
            .catch(function(err) {
              d.reject(err);
            })
          return d.promise;
        }

    // function isLessonDownloaded(id, mediaTypes) {
    //   $log.debug("isLessonDownloaded", id, mediaTypes)
    //   var d = $q.defer();
    //   var toCheckMedia = [];
    //   var downloaded = true;
    //   lessonDB.get(id).then(function(data) {
    //       if (!mediaTypes) {
    //         toCheckMedia = data.lesson.media;
    //       } else if (mediaTypes.length > 0) {
    //         angular.forEach(mediaTypes, function(mediaType) {
    //           if (mediaType === 'video') {
    //             for (var i = 0; i < data.lesson.media.length; i++) {
    //               if (data.lesson.media[i].url.split('.').pop() === 'mp4') {
    //                 toCheckMedia.push(data.lesson.media[i])
    //               }
    //             }
    //           }
    //           if (mediaType === 'audio') {
    //             for (var i = 0; i < data.lesson.media.length; i++) {
    //               if (data.lesson.media[i].url.split('.').pop() === 'mp3') {
    //                 toCheckMedia.push(data.lesson.media[i])
    //               }
    //             }
    //           }
    //           if (mediaType === 'image') {
    //             for (var i = 0; i < data.lesson.media.length; i++) {
    //               if (data.lesson.media[i].url.split('.').pop() === 'png') {
    //                 toCheckMedia.push(data.lesson.media[i])
    //               }
    //             }
    //           }
    //         })
    //       }
    //
    //       for (var i = 0; i < toCheckMedia.length; i++) {
    //         if (toCheckMedia[i].downloaded === false) {
    //           downloaded = false;
    //           break;
    //         }
    //       }
    //       d.resolve(downloaded);
    //     })
    //     .catch(function(err) {
    //       $log.debug("out", err)
    //       d.reject(err);
    //     })
    //
    //
    //   return d.promise;
    // }




    // function getFromKmapsBySr(sr){
    //     var result = kmapsDB.get(sr)
    //                     .then(function(doc){
    //                         return doc;
    //                     })
    //                     .catch(function(){
    //                         return null;
    //                     })
    //     return result;
    // }

    // function getDiagnosisQuestionByLevelNSkill(level, skill){

    //   var result = diagnosisQuestionsDB.query(function(doc, emit) {
    //                   emit(doc.level, doc);
    //                 }, { key: level })
    //                 .then(function(res) {
    //                   $log.debug('inside', res, skill);
    //                   var docs = [];
    //                     for(var i=0;i<res.rows.length;i++){
    //                       if(res.rows[i]["value"]["skill_area"] == skill){
    //                         docs.push(res.rows[i]["value"]);
    //                       }
    //                     }
    //                   return docs;
    //                   })
    //                   .catch(function(err) { console.log(err); return null;})
    //   return result;
    // }

    // function getDiagnosisQuestionById(id) {

    //   var result = diagnosisQuestionsDB.get(String(id))
    //                 .then(function(doc){
    //                   return doc;
    //                 })
    //                 .catch(function(){
    //                   return null
    //                 });

    //   return result;
    // }

    // function getDiagnosisQuestions(){
    //   var result = diagnosisQuestionsDB.get(String(id))
    // }
  }
})();
