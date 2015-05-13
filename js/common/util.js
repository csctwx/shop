var appUtil={
  styleMap:{},
  setUrlHash:function(v){
    location.hash=v;
  },
  init:function($sce,$http,$scope){
    this.$sce=$sce;
    this.$http=$http;
    this.$scope=$scope;
  },
  trustAsHtml:function(v){
    return this.$sce.trustAsHtml(v);
  },
  headersSetting:{
    headers:{
      name:"sprint",
      accept:"application/json"
    }
  },
  htmlToText:function(v){
    return $("<div>"+v+"</div>").text();
  },
  keyToTitle:function(k){
    var t="";
    var bFirst=true;
    var last="";
    for(var i=0;i<k.length;i++){
      var v=k[i];
      if(i==0){
        v=v.toUpperCase();
      }
      if(v>="A" && v<="Z" && !bFirst){
        bFirst=true;
        t+=" ";
      }else if(v>="A" && v<="Z"){
        if(i+1<k.length){
          var vv=k[i+1];
          if(!(vv>="A" && vv<="Z")){
            t+=" ";
          }
        }
      }else{
        bFirst=false;
      }
      
      t+=v;
      last=v;
    }
    return t;
  },
  formatDataUrl:function(url,remoteParameters){
    if(location.host.indexOf("localhost")==0 || location.host.indexOf("142.133.9.62")==0 || location.host.indexOf("boostprepaid")==0 || location.host.indexOf("sprintprepaid")==0){
      if(url.indexOf(0)!="/"){
        url="/"+url;
      }
      return "data"+url+".json?"+appUtil.appVersion;
    }else{
      if(remoteParameters){
        url=url+remoteParameters+"&"
      }else{
        url=url+"?"
      }
      return "/primary-rest/"+url+"brandId=SPP";
//      return "/primary-rest/"+url+"brandId=BST";
    }
  },
  postData:function($http,url,data){
    return $http.post(appUtil.formatDataUrl(url),data,appUtil.headersSetting);    
  },
  getData:function($http,url,parameters,extraheaders){
    var headers=angular.copy(appUtil.headersSetting);
    if(extraheaders){
      for(var k in extraheaders){
        headers.headers[k]=extraheaders[k];
      }
    }
    return $http.get(appUtil.formatDataUrl(url,parameters),headers);
  },
  createStyleClass:function(name,value){
    if(this.styleMap[name]){
      return;
    }
    $("head").append("<style>"+name+value+"</style>")
    this.styleMap[name]=1;
  },
  initObjValue:function(souData,valueObj,path,valueName,initValue){
    if(!angular.isObject(souData) || angular.isDate(souData) || angular.isArray(souData)){
      eval(path+"."+valueName+"="+initValue+";");
      return;
    }
    for(var k in souData){
      eval(path+"."+k+"={}");
      this.initObjValue(souData[k],valueObj,path+"."+k,valueName,initValue);
    }
  },
  resizeIframe:function (id,bReadySet) {
    var obj=$(id)[0];
    if(bReadySet){
      obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
    }else if(obj.ready){
      setTimeout("appUtil.resizeIframe('"+id+"',true)",100);
    }else{
      setTimeout("appUtil.resizeIframe('"+id+"',false)",100);
    }
  },
  retrieveUnion:function(d1,d2){
    var d={};
    if(d1!=null){
      for(var k in d1){
        d[k]=d1[k];
      }
    }
    if(d2!=null){
      for(var k in d2){
        d[k]=d2[k];
      }
    }
    return d;
  },
  retrieveIntersection:function(d1,d2){
    var d={};
    for(var k in d1){
      if(d2[k]==d1[k]){
        d[k]=d2[k];
      }
    }
    return d;
  },
  hasIntersection:function(d1,d2){
    for(var k in d1){
      if(d2[k]==d1[k]){
        return true;
      }
    }
    return false;
  },
  log:function(msg){
    try{
      console.log(msg);
    }catch(e){
      
    }
  },
  refreshContent:function(noScrollTop){
    if(!noScrollTop){
      setTimeout("appUtil.$scope.$apply();window.scrollTo(0,0);",1);
    }else{
      setTimeout("appUtil.$scope.$apply();",1);
    }
  },
  capitalize:function(txt,all) {
    if( (typeof all !== "undefined") && (all == "true") ){
      return txt.replace(/([^\W_]+[^\s-]*) */g);
    }else{
      return txt.charAt(0).toUpperCase() + txt.substr(1);
    }
  },
  removeItemFromArray:function(items,item){
    for(var i=0;i<items.length;i++){
      if(items[i]==item){
        items.splice(i,1);
        return;
      }
    }
  },
  toArray:function(v){
    if(!angular.isArray(v)){
      return [v];
    }
    return v;
  },
  simplifyObject:function(o){
    if(typeof o=="object"){
      for(var k in o){
        if(k=="$"){
          return appUtil.htmlToText(o.$);
        }else{
          o[k]=appUtil.simplifyObject(o[k]);
        }
      }
      return o;
    }else{
      return o;
    }
  },
  rename:function(obj,oldName,newName){
    if(obj.hasOwnProperty(oldName)){
      obj[newName]=obj[oldName];
      delete obj[oldName];
    }
  },
  generateDirectiveFun:function(moduleName,item){
    return function() {
      return {
        restrict: 'E',
        replace:true,
        templateUrl: "templates/"+moduleName+"/"+item+".html?"+appUtil.appVersion
      };
    }
  },
  buildModuleDirective:function(module,directiveSetting){
    directiveSetting.items=directiveSetting.items.split(",");
    for(var i=0;i<directiveSetting.items.length;i++){
      var item=directiveSetting.items[i];
      
      var key=directiveSetting.moduleName;
      var names=item.split("_");
      for(var n=0;n<names.length;n++){
        key+=appUtil.capitalize(names[n]);
      }
      
      module.directive(key, appUtil.generateDirectiveFun(directiveSetting.moduleName,item));
    }
  },
  formatImagePath:function(v){
    try{
      return v.substring(v.indexOf("/repository"));
    }catch(e){
      return v;
    }
  },
  formatCurrency:function(v){
    v=parseInt(v*100);
    if(v==0){
      return "0.00";
    }else if(v<10){
      return "0.0"+v;
    }else if(v<100){
      return "0."+v;
    }
    v=v+"";
    return v.substring(0,v.length-2)+"."+v.substring(v.length-2);
  },
  setMetaInfo:function(name,value){
    if(name=="title"){
      $('html head title').text(value);    
    }else{
      $('html head meta[name='+name+']').attr("content", value);    
    }
  }
};