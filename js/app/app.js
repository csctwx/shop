(function() {
  var app = angular.module('app-directives', []);
  var directiveSetting={
    moduleName:"app",
    items:"head,footer,home,shop,navigator,head_mini,plan"
  };
  appUtil.buildModuleDirective(app,directiveSetting);
})();
var appModule = angular.module('appSprint', ['ngDialog','app-directives','phone-directives','cart-directives','checkout-directives','banner-directives','page-directives','nextversion-directives'])
appModule.factory('loadingListener', [function() {
  var loadingCount=0;
  var loadingListener = {
    request: function(config) {
      loadingCount++;
      if(loadingCount>0){
        $( "#loading" ).show();
      }
      return config;
    },
    response: function(response) {
      loadingCount--;
      if(loadingCount==0){
        $( "#loading" ).hide();
      }
      return response;
    }
  };
  return loadingListener;
}]);
appModule.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('loadingListener'); 
}]);
appModule.config(['$locationProvider',function($locationProvider) {
  $locationProvider.hashPrefix('!');
}]);
appModule.config(['ngDialogProvider', function (ngDialogProvider) {
  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default',
    plain: false,
    showClose: true,
    closeByDocument: true,
    closeByEscape: true,
    appendTo: false,
    trapFocus:false,
    preCloseCallback: function () {
      console.log('default pre-close callback');
    }
  });
}]);

appModule.controller('appController', ['$sce','$http','$scope','$rootScope','ngDialog', function($sce,$http,$scope,$rootScope,ngDialog){
  this.config={
    DATA_VERSION:"1.0"
  }
  
  $scope.appUtil=appUtil;
  appUtil.init($sce,$http,$scope);
  $scope.JSON=JSON;
  $scope.commonData=commonData;
  $scope.pathMap=pathMap;

  $scope.assignContext=function(hashKey){
    if(hashKey[hashKey.length-1]!="/"){
      hashKey+="/";
    }
    
    if(!pathMap.home._setContext(hashKey)){
      hashKey=pathMap.home._hash;
      pathMap.home._setContext(hashKey);
    }
    appUtil.setUrlHash(hashKey);
  }
  this.isCurrentContext=function(hashKey){
    var ps=$scope.pathMap._getCurPath();
    for(var i=ps.length-1;i>=0;i--){
      if(ps[i]._hash){
        return ps[i]._match(hashKey);
      }
    }

    return false;
  }
  
  $scope.showMessage=function(msg,type){
    var dialog = ngDialog.open({
      template: '<p class="'+type+'">'+msg+'</p>',
      plain: true,
      closeByDocument: false,
      closeByEscape: true,
      overlay:false,
      showClose:false,
      type:type
    });
    setTimeout(function () {
      dialog.close();
    }, type=='error'?5000:type=='warning'?3000:2000);
  }
}]);

//Listen link (hash) update
$(function(){
  $(window).on( "hashchange",function(){
    pathMap._triggerApp();
  })
});

$(document).ready(function(){
  if(location.hash){
    setTimeout("pathMap._triggerApp();",100);
  }
})
function startApp(){
  if($(".cart").length<1 || $(".sticker").length<0){
    setTimeout(startApp,1);
    return;
  }
  $('.carousel').carousel({
    pause: true,
    interval: false
  })
  $(function(){
  $(".dropdown").hover(
    function() {
      $('.dropdown-menu', this).stop( true, true ).fadeIn("fast");
      $(this).toggleClass('open');
    },
    function() {
      $('.dropdown-menu', this).stop( true, true ).fadeOut("fast");
      $(this).toggleClass('open');
    });
  });
  
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
  $('.sticker').affix({
    offset: {
      top: $('.sticker').offset().top
    }
  });
}
startApp();
