#ionic setup start
# Required variables
#	$keep_crosswalk
#   keep-and-make-seperate-builds
#   remove-and-make-single-build
#   keep-and-make-single-build
	
gulp editPackageJson --env=$environment --app_type=$content_type --campaign_name=$campaign_name --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb


ionic state reset

#ionic platform rm android
#ionic platform add android

echo crosswalk is $crosswalk

if [ "$crosswalk" = 'keep-and-make-seperate-builds' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  crosswalk_status="with_crosswalk"
  echo "kept crosswalk"
fi
if [ "$crosswalk" = 'remove-and-make-single-build' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  crosswalk_status="without_crosswalk"
  echo "removed crosswalk"
fi  
if [ "$crosswalk" = 'keep-and-make-single-build' ]; then
  echo "removing crosswalk"
  echo "cdvBuildMultipleApks=false" > platforms/android/build-extras.gradle
  cp config_with_crosswalk_single_build.xml config.xml
  build_architecture="x86andarm"
  crosswalk_status="with_crosswalk"
  echo "removed crosswalk"
fi  

rm platforms/android/build/outputs/apk/*




#ionic setup end