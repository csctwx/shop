(function() {
  var bannerModule = angular.module('banner-directives', []);
  bannerModule.directive("banner", function() {
    return {
      restrict: 'E',
      replace:true,
      templateUrl: "templates/banner/content.html?"+appUtil.appVersion
    };
  });
  bannerModule.directive("bannerItem", function() {
    return {
      restrict: 'E',
      replace:true,
      template:function(elem,attr){
        if(!attr.options){
          return;
        }
        var classKey=attr.url+"_"+attr.index;
        var objKey="\""+attr.url+"\"";
        var parameters="\""+attr.url+"\"";
        
        if(attr.extraheaders){
          objKey+="+JSON.stringify("+attr.extraheaders+")";
          parameters+=","+attr.extraheaders;
        }else{
          parameters+=",null";
        }
        
        
        var os=attr.options.toLowerCase().split(",");
        var htmlHeader="";
        var htmlFooter="";
        var cClass="";
        if(os.indexOf("bg_image")>=0){
          var cClass="class='"+attr.class+" "+classKey+"'";
        }else{
          var cClass=attr.class?"class='"+attr.class+"'":"";        
        }
        var initFn="ng-init='bannerController.loadData("+parameters+")'";
        var obj="bannerController.dataMap["+objKey+"].value["+attr.index+"]";

        if(os.indexOf("url")>=0){
          htmlHeader+="<a "+initFn+" "+cClass+" ng-href='{{"+obj+".url}}'>";
          htmlFooter="</a>"+htmlFooter;
        }else{
          htmlHeader+="<a "+initFn+" "+cClass+">";
          htmlFooter="</a>"+htmlFooter;
        }
        
        if(os.indexOf("phone_number")>=0){
          htmlHeader+="<span>{{"+obj+"}}</span>";
        }
        
        if(os.indexOf("image")>=0){
          htmlHeader+="<img ng-src='{{"+obj+".imageUrl}}'/>";
        }
        if(os.indexOf("icon")>=0){
          htmlHeader+="<img class='promoIcon' ng-src='{{"+obj+".imageUrl}}'/>";
        }
        if(os.indexOf("title")>=0){
          if(attr.class=="promo01"){
            htmlHeader+="<h1 class='promoHeading'>{{"+obj+".title}}</h1>";
          }else{
            htmlHeader+="<h3 class='promoHeading'>{{"+obj+".title}}</h1>";
          }
        }
        if(os.indexOf("description")>=0){
          htmlHeader+="<p class='promoText'>{{"+obj+".description}}</p>";
        }
        if(os.indexOf("link_text")>=0){
          htmlHeader+="<span class='promoLink'>{{"+obj+".linkText}}</span>";
        }
        if(os.indexOf("text")>=0){
          htmlHeader+="<span class='promoLink'>{{"+obj+"}}</span>";
        }
        return htmlHeader+htmlFooter;
        
      }
    };
  });
})();

appModule.controller('bannerController', ['$http','$scope','$sce', function($http,$scope,$sce){
  var bannerController=this;
  this.dataMap={};

  this.loadData=function(url,extraheaders){
    var key=url;
    if(extraheaders){
      key+=JSON.stringify(extraheaders);
    }
    var item = this.dataMap[key];
    if(item!=null && item.value!=null && new Date().getTime()-item.time<600000){
      return;
    }else{
      item={time:new Date().getTime(),value:{}};
      this.dataMap[key]=item;
    }

    appUtil.getData($http,url,null,extraheaders).success(function(data){
      var d=bannerController.scrubData(data.responses.response);
      bannerController.dataMap[key].value=d;
      for(var i=0;i<d.length;i++){
        if(d[i].imageUrl){
          appUtil.createStyleClass("."+url+"_"+i,"{background-image:url("+d[i].imageUrl+")}")
        }
      }
      appUtil.refreshContent();
    }); 
  };
  
  this.scrubData=function(data){
    var returnData=[];
    var ds=appUtil.toArray(data);
    for(var i=0;i<ds.length;i++){
      var d=ds[i];
      var item={};
      if(d.getBannerResponse && d.getBannerResponse.banner){
        item=appUtil.simplifyObject(d.getBannerResponse.banner);
        item.imageUrl=appUtil.formatImagePath(item.imageUrl);
      }else{
        item=d.$;
      }
      returnData.push(item);
    }
    return returnData;
  };
  
  this.setContext=function(key,parameter){
    if(key=="banner_context"){
      if(!parameters){
        location.hash="#home";
        return;
      }
      parameters=parameters[0];
      $http.get(parameters).success(function(data){
        try{
          data="<div "+data.split("<body")[1].split("</body>")[0]+"</div>";
          var html=$(data).find(".tab-pane").html();
          if(html){
            data=html;
          }
        }catch(e){
        }
        $("#bannerContext").html(data);
        appUtil.refreshContent();
      }).error(function(data){
        location.hash="#home";
      });
    }
  }
}]);