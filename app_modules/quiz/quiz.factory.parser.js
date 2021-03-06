(function() {
  'use strict';
  angular
    .module('zaya-quiz')
    .factory('widgetParser', widgetParser)
  widgetParser.$inject = ['CONSTANT', '$log', 'mediaManager','$q'];

  function widgetParser(CONSTANT, $log, mediaManager,$q) {
    var soundIdRegex = /(?:\[\[)(?:sound)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    var imageTagRegex = /(?:\[\[)(?:img)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    return {
      getSoundId: getSoundId,
      getImageId: getImageId,
      getImageSrc: getImageSrc,
      getSoundSrc: getSoundSrc,
      parseToDisplay: parseToDisplay,
      replaceImageTag: replaceImageTag,
      removeSoundTag: removeSoundTag,
      removeImageTag: removeImageTag,
      getLayout: getLayout,
      getOptionsFontSize: getOptionsFontSize,
      addContainerToText : addContainerToText
    }

    function getSoundId(string) {
      if (soundIdRegex.exec(string)) {
        return soundIdRegex.exec(string)[1];
      }
    }

    function getImageId(string) {
      if (imageTagRegex.exec(string)) {
        return imageTagRegex.exec(string)[1];
      }
    }

    function getImageSrc(id, index, quiz) {

      return mediaManager.getPath(quiz.objects[index].node.type.content.widgets.images[id]);
    }
    function getSoundSrc(id, index, quiz) {
      return mediaManager.getPath(quiz.objects[index].node.type.content.widgets.sounds[id]);
    }
    function parseToDisplay(string, index, quiz) {
      var d = $q.defer();
      var text = this.removeSoundTag(string, index);
      text = this.addContainerToText(text)
      if (this.getImageId(text)) {
         this.replaceImageTag(text, index, quiz).then(function(text){
           d.resolve(text.trim().length > 0 ? text.trim() : CONSTANT.WIDGETS.SPEAKER_IMAGE)
         });
      }
      else{
        d.resolve(text.trim().length > 0 ? text.trim() : CONSTANT.WIDGETS.SPEAKER_IMAGE)
      }
      return d.promise;
    }

    function addContainerToText(text) {
        if(text.replace(imageTagRegex, "").trim().length){
            return text.match(imageTagRegex) ? "<div>" + text.replace(imageTagRegex, "") + "</div>" + text.match(imageTagRegex)[0] : "<div>" + text.replace(imageTagRegex, "") + "</div>";
        }
        else{
            return text.match(imageTagRegex) ? text.match(imageTagRegex)[0] : "";
        }
    }
    function removeSoundTag(string) {
      return string.replace(soundIdRegex, "");
    }

    function removeImageTag(string) {
      return string.replace(imageTagRegex, "");
    }

    function replaceImageTag(string, index, quiz) {
      return this.getImageSrc(this.getImageId(string), index, quiz).then(function(data) {
        return string.replace(imageTagRegex, "<img class='content-image' src='" +
          data + "'>");
      })
    }

    function getLayout(question, index, quiz) {
      var layout = CONSTANT.WIDGETS.LAYOUT.LIST;

      angular.forEach(question.node.type.content.options, function(option) {
        if (this.getImageId(option.option) || this.getSoundId(option.option)) {
          layout = CONSTANT.WIDGETS.LAYOUT.GRID;
        }
        // var text = this.removeImageTag(this.removeSoundTag(option.option));
        // text = text.trim();
        // if (text.length >= CONSTANT.WIDGETS.OPTIONS.LAYOUT_THRESHOLD) {
        //   layout =  CONSTANT.WIDGETS.LAYOUT.LIST;
        // }
      }, this, CONSTANT);
      return layout;
    }

    function getOptionsFontSize(options) {
      var size = 'font-lg'
      angular.forEach(options, function(option) {
        if (option.widgetHtml.length > CONSTANT.WIDGETS.OPTIONS.FONT_SIZE_THRESHOLD) {
          size = 'font-md'
        }
      })
      return size;
    }
  }
})();
