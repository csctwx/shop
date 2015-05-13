(function() {
  var pageModule = angular.module('page-directives', []);
  pageModule.directive("page", function() {
    return {
      restrict: 'E',
      replace:true,
      templateUrl: "templates/page/content.html?"+appUtil.appVersion
    };
  });
})();

appModule.controller('pageController', ['$http','$scope','$sce', function($http,$scope,$sce){
  var pageController=this;

  this.buildContext=function(parameters){
    $http.get("pages/"+parameters+".html").success(function(data){
      try{
        data="<div "+data.split("<body")[1].split("</body>")[0]+"</div>";
        var html=$(data).find(".main").html();
        if(html){
          data=html;
        }
      }catch(e){
      }
      $("#pageContext").html(data);
      var fn="pageController.init"+appUtil.capitalize(parameters);
      eval("if("+fn+"){"+fn+"()}");
      appUtil.refreshContent($scope);
    }).error(function(data){
      location.hash="#home";
    });
    appUtil.refreshContent($scope);
  };
  this.setContext=function(key,parameter){
    if(parameter){
      parameter=parameter.replace("/","");
      pageController.buildContext(parameter);
    }
  };
  this.initAdditionalServices=function(){
    $('#example1').accordionSlider({
      width:1138,
      height:420,
      margin:0,
      responsiveMode:'auto',
      visiblePanels:3,
      closePanelsOnMouseOut:true,
      autoplay:false
    });
    // change the responsive mode
    $('.controls a').click(function(event) {
      event.preventDefault();
      if ($(this).hasClass('auto')) {
        // change the responsive mode to 'auto' and remove the 'custom-responsive' class
        $('#example1').removeClass('custom-responsive');
        $('#example1').accordionSlider('responsiveMode', 'auto');
        // change the arrows' visibility
        $('.auto-arrow').show();
        $('.custom-arrow').hide();
      } else if ($(this).hasClass('custom')) {
        // change the responsive mode to 'custom' and add the 'custom-responsive' 
        // class in order to use it as a reference in the CSS code
        $('#example1').addClass('custom-responsive');
        $('#example1').accordionSlider('responsiveMode', 'custom');
        // change the arrows' visibility
        $('.custom-arrow').show();
        $('.auto-arrow').hide();
      }
    });
  }
}]);