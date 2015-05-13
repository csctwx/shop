(function() {
  var phoneModule = angular.module('phone-directives', []);
  var directiveSetting={
    moduleName:"phone",
    items:"container,list,list_banner,list_legal,list_reason,list_filter,list_sort,list_item,details,details_images,details_base,details_other,details_features,details_legal,compare,genie,list_compare_mini"
  };
  appUtil.buildModuleDirective(phoneModule,directiveSetting);
})();
appModule.controller('phoneController', ['$http','$scope','$sce', function($http,$scope,$sce){
  this.status="init";
  var phoneController=this;
  var filterOptions={
    onSale:{label:"On Sale",matchExp:"item.hasDiscount"},
    New:{},
    PreOwned:{label:"Pre-Owned"},
    Bar:{},
    Slider:{},
    Flip:{},
    rate1:{label:"★ & Up",value:1,matchExp:"parseFloat(item.ReviewStatistics.AverageOverallRating)>1"},
    rate2:{label:"★ ★ & Up",value:2,matchExp:"parseFloat(item.ReviewStatistics.AverageOverallRating)>2"},
    rate3:{label:"★ ★ ★ & Up",value:3,matchExp:"parseFloat(item.ReviewStatistics.AverageOverallRating)>3"},
    rate4:{label:"★ ★ ★ ★ & Up",value:4,matchExp:"parseFloat(item.ReviewStatistics.AverageOverallRating)>4"},
    TouchScreen:{label:"Touchscreen"},
    QWERTRYKeyboard:{label:"QWERTRY Keyboard"},
    Camera:{hiddenOnUnexist:true},
    FrontFacingCamera:{label:"Front-facing Camera"},
    GPS:{label:"GPS/Navigation"},
    Music:{hiddenOnUnexist:true},
    Wifi:{label:"Wi-Fi"},
    Bluetooth:{hiddenOnUnexist:true},
    SpeakerPhone:{label:"Speakerphone"},
    "4GLTE":{label:"4G LTE"},
    Text:{label:"Text Messaging"},
    Video:{hiddenOnUnexist:true},
    HotSpot:{hiddenOnUnexist:true},
    HtmlBrowser:{label:"HTML Browser"},
    UleCertified:{label:"ULE Certified"}
  }
  for(var k in filterOptions){
    var o=filterOptions[k];
    if(!o.label){
      o.label=k;
      o.value=k;
      o.matchMap={};
    }
    o.id=k;
  }
  
  this.sortList=function(sort,listData){
    if(sort){
      var sortFn=null;
      if(sort=="featured"){
        sortFn="parseInt(a.genieOrder)>parseInt(b.genieOrder)?1:-1";
      }else if(sort=="timeZA"){
        sortFn="a.generalAvailabilityDate>b.generalAvailabilityDate?-1:1";
      }else if(sort=="priceAZ"){
        sortFn="parseFloat(a.selectedVariant.price)>parseFloat(b.selectedVariant.price)?1:-1";
      }else if(sort=="priceZA"){
        sortFn="parseFloat(a.selectedVariant.price)>parseFloat(b.selectedVariant.price)?-1:1";
      }else if(sort=="rateZA"){
        sortFn="parseFloat(a.ReviewStatistics.AverageOverallRating)>parseFloat(b.ReviewStatistics.AverageOverallRating)?-1:1";
      }else if(sort=="nameAZ"){
        sortFn="(a.brand + ' ' + a.name).toLowerCase()>(b.brand + ' ' + b.name).toLowerCase()?1:-1";
      }else{
        return listData;
      }
      var sortMethod=function(a,b){
        return eval(sortFn);
      }
      listData.sort(sortMethod);
    }
    return listData;
  }
    
  this.list={
    data:[],
    filter:{
      urlHash:{
        value:null,
        initSelectedOptions:function(filterHash){
          var hasExtend=false;
          var hash=","+filterHash+",";
          for(var k in phoneController.list.filter.data.map){
            var group=phoneController.list.filter.data.map[k];
            group.extend=false;
            for(var i=0;i<group.options.length;i++){
              if(hash.indexOf(","+group.options[i].id+",")>=0){
                group.options[i].checked=true;
                group.extend=true;
                hasExtend=true;
              }else{
                group.options[i].checked=false;
              }
            }
            if(!hasExtend){
              phoneController.list.filter.data.map.condition.extend=true;
            }
          }
        }
      },
      data:{
        noFilter:true,
        map:{
          special:{options:[filterOptions.onSale]},
          condition:{title:"Condition",extend:true,options:[filterOptions.New,filterOptions.PreOwned]},
          phoneTypes:{title:"Phone Type",buildByData:true,options:[],matchField:"item.type"},
          customerRating:{title:"Customer Rating",selectSingle:true,options:[
            filterOptions.rate4,
            filterOptions.rate3,
            filterOptions.rate2,
            filterOptions.rate1
          ]},
          brands:{title:"Brands",buildByData:true,relation:"or",options:[],matchField:"item.brand"},
          features:{title:"Features",relation:"and",options:[
            filterOptions.TouchScreen,
            filterOptions.QWERTRYKeyboard,
            filterOptions.Camera,
            filterOptions.FrontFacingCamera,
            filterOptions.GPS,
            filterOptions.Music,
            filterOptions.Wifi,
            filterOptions.Bluetooth,
            filterOptions.SpeakerPhone,
            filterOptions["4GLTE"],
            filterOptions.Text,
            filterOptions.Video,
            filterOptions.HotSpot,
            filterOptions.HtmlBrowser,
            filterOptions.UleCertified
          ]},
          phoneStyles:{title:"Phone Styles",relation:"or",options:[filterOptions.Bar,filterOptions.Slider,filterOptions.Flip]}
        },
        init:function(){
          this.uiSort=[this.map.condition,this.map.phoneTypes,this.map.customerRating,this.map.brands,this.map.features,this.map.phoneStyles]
          this.filterAnd=[this.map.special,this.map.customerRating,this.map.features];
          this.filterOr=[this.map.condition,this.map.phoneTypes,this.map.brands,this.map.phoneStyles];
        }
      },
      init:function(phoneList,filterHash){
        //init filter data
        if(!this.data.uiSort){
          this.data.init();
        }

        for(var k in this.data.map){
          for(var n=0;n<this.data.map[k].options.length;n++){
            this.data.map[k].options[n].matchMap={};
          }
        }
        
        //assign match data
        this.phoneMap={};
        for(var p=0;p<phoneList.length;p++){
          var item=phoneList[p];
          this.phoneMap[item.id]=item;
          
          for(var k in filterOptions){
            try{
              if (filterOptions[k].matchExp && eval(filterOptions[k].matchExp)){
                this.addMatchData(filterOptions[k],item);
              }
            }catch(e){}
          }
          for(var k in this.data.map){
            if(this.data.map[k].matchField){
              var v=eval(this.data.map[k].matchField);
              var option=null;
              for(var i= 0;i<this.data.map[k].options.length;i++){
                if(this.data.map[k].options[i].label==v){
                  option=this.data.map[k].options[i];
                }
              }
              if(option==null){
                option={label:v,matchMap:{},id:v.replace(/ /g,'_')};
                this.data.map[k].options.push(option);
              }
              this.addMatchData(option,item);
            }
          }

          for(var i=0;i<item.filters.length;i++){
            var f = item.filters[i];
            if(filterOptions[f]){
              this.addMatchData(filterOptions[f],item);
            }
          }
          if(!filterOptions.PreOwned.matchMap[item.id]){
            this.addMatchData(filterOptions.New,item);
          }
        }
        
        //hidden unexist options
        for(var k in this.data.map){
          var group=this.data.map[k];
          var removeList=[];
          for(var i=0;i<group.options.length;i++){
            var o=group.options[i];
            if(JSON.stringify(o.matchMap)=="{}"){
              if(group.buildByData){
                removeList.push(i);
              }else{
                o.disabled=true;
              }
              o.checked=false;
            }else{
              o.hidden=false;
            }
          }
          for(var i=removeList.length-1;i>=0;i--){
            group.options.splice(removeList[i],1);
          }
        }
        this.urlHash.initSelectedOptions(filterHash);
      },
      getFilterResult:function(){
        if(!this.phoneMap){
          return;
        }
        this.urlHash.value="";
        this.data.noFilter=true;
        var map=this.phoneMap;
        //get filter result by "And" option groups
        for(var i=0;i<this.data.filterAnd.length;i++){
          var andGroup=this.data.filterAnd[i];
          for(var n=0;n<andGroup.options.length;n++){
            var option=andGroup.options[n];
            if(option.checked){
              if(andGroup.selectSingle){
                if(andGroup.lastSelection==null){
                  andGroup.lastSelection=option;
                }else if(andGroup.lastSelection!=option){
                  andGroup.lastSelection.checked=false;
                  andGroup.lastSelection=option;
                }
              }
              this.data.noFilter=false;
              this.urlHash.value+=","+option.id;
              map=appUtil.retrieveIntersection(map,option.matchMap);
            }else if(option==andGroup.lastSelection){
              andGroup.lastSelection=null;
            }
          }
        }
        
        //get filter result by "Or" option groups
        for(var i=0;i<this.data.filterOr.length;i++){
          var orGroup=this.data.filterOr[i];
          //disable each "Or" group option by current filter result and other "Or" group options
          var tmpUnionMap=map;
          for(var ii=i+1;ii<this.data.filterOr.length;ii++){
            var tmpOrGroup=this.data.filterOr[ii];
            if(tmpOrGroup==orGroup){
              continue;
            }
            tmpUnionMap=this.retrieveOptionsUnion(tmpOrGroup.options,tmpUnionMap);
          }
          for(var n=0;n<orGroup.options.length;n++){
            var option=orGroup.options[n];
            if(appUtil.hasIntersection(tmpUnionMap,option.matchMap)){
              option.disabled=false;
            }else{
              option.disabled=true;
              option.checked=false;
            }
            if(option.checked){
              this.data.noFilter=false;
              this.urlHash.value+=","+option.id;
            }
          }
          //get union result
          map=this.retrieveOptionsUnion(orGroup.options,map);
        }

        //disable "And" group options by final result
        for(var i=0;i<this.data.filterAnd.length;i++){
          var andGroup=this.data.filterAnd[i];
          for(var n=0;n<andGroup.options.length;n++){
            var option=andGroup.options[n];
            if(!option.checked){
              option.disabled=!appUtil.hasIntersection(map,option.matchMap);
            }
          }
        }
        //transfer to array 
        var list=[];
        for(var k in map){
          list.push(map[k]);
        }
        if(this.urlHash.value){
          this.urlHash.value=pathMap._phones._hash+this.urlHash.value.substring(1)+"/";
        }else{
          this.urlHash.value=pathMap._phones._hash;
        }
        appUtil.setUrlHash(this.urlHash.value);
        return list;
      },
      retrieveOptionsUnion:function(options,map){
        var tmpUnion=null;
        for(var i=0;i<options.length;i++){
          if(options[i].checked){
            tmpUnion=appUtil.retrieveUnion(options[i].matchMap,tmpUnion);
          }
        }
        if(tmpUnion!=null){
          map=appUtil.retrieveIntersection(tmpUnion,map);
        }
        return map;
      },
      addMatchData:function(filterOption,data){
        filterOption.matchMap[data.id]=data;
      },
      removeAll:function(){
        noFilter=true;
        
        for(var k in this.data.map){
          var group=this.data.map[k];
          if(group.selectSingle){
            group.lastSelection=null;
          }
          for(var n=0;n<group.options.length;n++){
            var option = group.options[n];
            option.checked=false;
            option.disabled=JSON.stringify(option.matchMap)=="{}";
          }
        }
      }
    },
    sort:"featured",
    getResultList:function(){
      if(!pathMap._phones._match(location.hash) || phoneController.status=="init"){
        return;
      }
      return this.getSortedList(this.filter.getFilterResult());
    },
    getSortedList:function(listData){
      phoneController.sortList(this.sort,listData);
      return listData;
    }
  }

  this.scrubPhoneData= function(item) {
    item=appUtil.simplifyObject(item);
    appUtil.rename(item,"externalUrl","id");
    appUtil.rename(item,"phoneName","name");
    appUtil.rename(item,"phoneType","type");
    appUtil.rename(item,"manufacturerName","brand");
    appUtil.rename(item,"associatedAccessoryId","accessoryIds");
    if(item.phoneViewImages){
      appUtil.rename(item,"phoneViewImages","images");
      item.images=appUtil.toArray(item.images.phoneViewImage);
      for(var i=0;i<item.images.length;i++){
        item.images[i]=appUtil.formatImagePath(item.images[i].uRI);
      }
    }
    if(item.filters){
      item.filters=appUtil.toArray(item.filters.feature);
    }
    appUtil.rename(item,"phoneVariants","variants");
    item.variants=appUtil.toArray(item.variants.phoneVariant);
    if(!item.features){
      item.features={};
    }

    var tmpMemoryOptions = {};
    item.colorOptions = [];
    item.colorValues = {};
    item.memoryOptions = [];
    
    item.variantMap={};
    var selectedVariant=null;
    var selectedWeight = -1;
    for(j=0; j<item.variants.length; j++) {
      var variant=item.variants[j];
      appUtil.rename(variant,"shopGridPicture","gridImage");
      if(variant.gridImage){
        variant.gridImage=appUtil.formatImagePath(variant.gridImage.uRI);
      }
      if( variant.colorVariant && variant.colorVariant.$ ){
        appUtil.rename(variant,"colorVariant","color");
        variant.color = appUtil.capitalize(variant.color);
        item.colorValues [ variant.color ] = variant.gradientColor;
      }
      if( variant.memoryVariant && variant.memoryVariant.$){
        appUtil.rename(variant,"memoryVariant","memory");
        variant.memory = variant.memory.toUpperCase();
        tmpMemoryOptions[ variant.memory ] = variant.memory;
      }
      
      var tmpWeight=0;
      if(variant.discount){
        item.hasDiscount=true;
        tmpWeight+=1;
      }
      if( variant.isDefault == "true" ) {
        variant.isDefault=true;
      }
      if(variant.isDefault){
        tmpWeight+=2;
      }
      if(variant.inventory=="in-stock"){
        tmpWeight+=4;
      }
      variant.hiddenPrice=variant.hiddenPrice=="true";
      variant.purchaseLimit=parseInt(variant.purchaseLimit);
      
      if(selectedWeight<tmpWeight){
        selectedWeight=tmpWeight;
        item.selectedVariant=variant;
      }

      if(variant.inventory=="out-of-stock" || variant.inventory=="end-of-life"){
        variant.noMore=true;
        variant.cartLabel="Out of Stock";
      } else if( variant.inventory=="pre-order") {
        variant.cartLabel="Pre Order";
      } else if( variant.inventory=="back-order") {
        variant.cartLabel="Back Order";
      } else {
        if(variant.hiddenPrice){
          variant.cartLabel="Add to Cart to see price";
        }else{
          variant.cartLabel="Add to Cart";
        }
      }

    }
    if(item.selectedVariant){
      item.selectedColor=item.selectedVariant.color;
      item.selectedMemory=item.selectedVariant.memory;
    }
    
    item.colorOptions = Object.keys(item.colorValues).sort();
    item.memoryOptions = Object.keys(tmpMemoryOptions).sort();
    
    item.updateSelectedVariant = function() {
      for( var i=0; i<this.variants.length; i++ ) {
        if( this.selectedColor == this.variants[i].color && (this.selectedMemory == this.variants[i].memory)) {
          this.selectedVariant = this.variants[i];
        }
      }
    }
    if(item.compareImages){
      var cImages=appUtil.toArray(item.compareImages.compareImage);
      for(var i=0;i<cImages.length;i++){
        item[cImages[i].fileName+"_img"]=appUtil.formatImagePath(cImages[i].uRI);
      }
      delete item.compareImages;
    }
  }
  
  this.scrubFeaturesData=function(data){
    appUtil.rename(data,"generalFeatures","general");
    appUtil.simplifyObject(data.general);
    
    appUtil.rename(data,"specialFeatures","special");
    appUtil.simplifyObject(data.special);
    
    appUtil.rename(data,"technicalFeatures","technical");
    var group=appUtil.toArray(data.technical.group);
    var os=data.technical.os?appUtil.htmlToText(data.technical.os.$):null;
    var processor=data.technical.processor?appUtil.htmlToText(data.technical.processor.$):null;
    var memory=data.technical.memory?appUtil.htmlToText(data.technical.memory.$):null;
    
    var tmpTechnical={os: os,processor:processor,memory:memory};
    for(var i=0;i<group.length;i++){
      var tmpSpecs = tmpTechnical[group[i]["@id"]]={};
      var specs=appUtil.toArray(group[i].specs.spec);
      if("whats_included"==group[i]["@id"]){
        tmpTechnical.whats_included=appUtil.simplifyObject(specs);
      }else{
        for(var n=0;n<specs.length;n++){
          tmpSpecs[specs[n]["@type"]]=appUtil.htmlToText(specs[n].$);
        }
      }
    }
    
    data.technical=tmpTechnical;
    if(data.specifationImage){
      data.specifationImage=appUtil.formatImagePath(data.specifationImage.uRI.$);
    }
  }
  
  this.attachFeatures=function(item){
    if(jQuery.isEmptyObject(item.features)){
      appUtil.getData($http,"shop_get_features_by_external_url","?phoneId="+item.id).success(function(data){
        if(jQuery.isEmptyObject(item.features)){
          angular.extend(item.features,data.responses.response[0].getFeaturesResponse.phoneFeatures);
          phoneController.scrubFeaturesData(item.features);
        }
      }); 
    }
  }
  
  this.attachPhoneData=function(obj,id,bAttachFeatures){
    if(jQuery.isEmptyObject(obj)){
      appUtil.getData($http,"shop_get_phone_by_external_url","?phoneId="+id).success(function(data){
        if(jQuery.isEmptyObject(obj)){
          var tmpObj=appUtil.simplifyObject(data.responses.response[0].getPhoneDetailsResponse.phoneDetails.phoneDetail);
          if(angular.isArray(tmpObj)){
            for(var i=0;i<tmpObj.length;i++){
              if(angular.isArray(tmpObj[i].phoneVariants.phoneVariant)){
                tmpObj=tmpObj[i];
                break;
              }
            }
            if(angular.isArray(tmpObj)){
              tmpObj=tmpObj[0];
            }
          }
          angular.extend(obj,tmpObj);
          phoneController.scrubPhoneData(obj);
          appUtil.refreshContent();
          obj.id=id;
          if(bAttachFeatures){
            phoneController.attachFeatures(obj);
          }
        }
      }); 
    }
  }
  
  this.attachCompareFeatures=function(item){
    appUtil.getData($http,"shop_phone_compare","?phones="+item.id).success(function(data){
      data = data.responses.response[0].comparePhoneResponse.comparePhoneList.comparePhone;
      phoneController.compareItems.fillData(item,data);
    }); 
  }
  this.details={
    data:{},
    planPage:null,
    
    init:function(id){
      $http.get("/primary/shop_plans").success(function(data){
        try{
          phoneController.details.planPage=$sce.trustAsHtml($("<div "+data.split("<body ")[1].split("</body>")[0]+"</div>").find(".tab-pane").html());
        }catch(e){}
      });
      this.data={};
      phoneController.attachPhoneData(this.data,id,true);
    }
  };
  
  this.compareItems={
    COMPARE_SIZE:4,
    data:{version:$scope.app.config.DATA_VERSION, updateTime:new Date().getTime(),items:[]},
    ItemData:{
      id:null,
      sku:null,
      brand:null,
      name:null,
      compare_th_img:null,
      compare_img:null,
      price:null,
      rate:0,
      review:"N/A",
      os:"N/A",
      display:{value:"N/A"},
      camera:{value:"N/A"},
      wifi:"No",
      "web-browser":{value:"N/A"},
      email:"No",
      video:"No",
      "music-player":"No",
      speakerphone:"No",
      memory:"N/A",
      processor:{value:"N/A"},
      calendar:"No",
      voicemail:"No",
      bluetooth:{value:"N/A"},
      width:"N/A",
      height:"N/A",
      weight:"N/A",
      depth:"N/A",
      screen_size:"N/A",
      battery_type:"N/A",
      talking_time:"N/A",
      "4g":{value:"N/A"},
      hotspot:"No",
      "qwerty-keyboard":{value:"N/A"},
      "flash-player":"No",
      gps:"No",
      "3g":"No"
    },
    setItemAttr:function(item,data){
      if(data.type && data.type.$){
        var t=data.type.$;
      }else if(data["@type"]){
        var t=data["@type"];
      }else{
        return;
      }
      var v = item[t];
      if(angular.isObject(v)){
        if(data.title && data.title.$){
          v.value=data.title.$;
        }
        if(data.description && data.description.$){
          v.description=data.description.$;
        }
      }else if(v=="No"){
        item[t]="Yes";
      }else{
        if(data.title && data.title.$){
          item[t]=data.title.$;
        }else if(data.$){
          item[t]=data.$;
        }
      }
    },
    fillData:function(item,data){
      if(data.generalFeatures){
        data.generalFeatures=appUtil.toArray(data.generalFeatures);
        for(var i=0;i<data.generalFeatures.length;i++){
          var d=data.generalFeatures[i];
          if(!d.type){
            continue;
          }
          this.setItemAttr(item,d);
        }
      }

      if(data.technicalFeatures ){
        if(data.technicalFeatures.os){
          item.os=data.technicalFeatures.os.$;
        }
        if(data.technicalFeatures.group){
          data.technicalFeatures=appUtil.toArray(data.technicalFeatures.group);
          for(var i=0;i<data.technicalFeatures.length;i++){
            var d=data.technicalFeatures[i];
            for(var n=0;n<d.specs.spec.length;n++){
              this.setItemAttr(item,d.specs.spec[n]);
            }
          }
        }
      }
      this.save()
    },
    init:function(){
      var d=sessionStorage.getItem( "sprintShop-compare");
    
      eval("d="+d);
      if(d){
        if(d.version!=$scope.app.config.DATA_VERSION || d.updateTime-new Date().getTime()>24*3600000){
          sessionStorage.setItem( "sprintShop-compare",this.data);
          for(var i=0;i<this.COMPARE_SIZE;i++){
            this.data.items.push(angular.copy(this.ItemData));
          }
        }else{
          this.data = d; 
        }
      }
    },
    getTitle:function(){
      var title="";
      for(var i=0;i<this.data.items.length;i++){
        title+=this.data.items[i].getPhone().name;
        if(this.data.items.length>1){
          if(i<this.data.items.length-2){
            title+=", ";
          }else if(i==this.data.items.length-2){
            title+=" and ";
          }
        }
      }
      if(!title){
        title="No comparing item";
      }else{
        title="Compare the "+title;
      }
      return title;
    },
    getValueById:function(idx,attr,true_false){
      var item=this.data.items[idx];
      var value=null;
      if(item){
        try{
          value=eval("item."+attr);
        }catch(e){
          value=undefined;
        }
        if(value==undefined){
          value="N/A";
        }else if(true_false){
          value="yes";
        }
      }
      if(value){
        value=$("<div>"+value+"</div>").text();
      }
      return value;
    },
    addItem:function(item){
      if(this.isInclude(item)){
        return;
      }
      if(this.hasSpace()){
        if(!item.compareFeatures){
          item.compareFeatures=angular.copy(this.ItemData);
          var d=item.compareFeatures;
          d.id=item.id;
          d.sku=item.selectedVariant.sku;
          d.brand=item.brand;
          d.name=item.name;
          d.price=item.selectedVariant.price;
          d.compare_th_img=item.compare_th_img;
          d.compare_img=item.compare_img;
          
          if(item.ReviewStatistics){
            if(item.ReviewStatistics.AverageOverallRating){
              d.rate=item.ReviewStatistics.AverageOverallRating;
            }
            if(item.ReviewStatistics.TotalReviewCount){
              d.review=item.ReviewStatistics.TotalReviewCount;
            }
          }
          
          phoneController.attachCompareFeatures(d);
        }
        this.data.items.push(item.compareFeatures);
        this.save();
      }else{
        $scope.showMessage("You can only compare up to "+this.COMPARE_SIZE+" items","warning");
        var chks=$("#phoneListArea").find("input[type='checkbox']");
        for(var i=0;i<chks.length;i++){
          var chk=$("#phoneListArea").find("input[type='checkbox']")[i];
          txt=$(chk).parent().text();
          if($(chk).prop('checked') && txt!="Remove"){
            $(chk).prop('checked',false);
          }
        }
      }
    },
    removeItem:function(item){
      for(var i=0;i<this.data.items.length;i++){
        if(this.data.items[i].id==item.id){
          this.data.items.splice(i,1);
        }
      }
      this.save();
    },
    handleItem:function(item){
      if(this.isInclude(item)){
        this.removeItem(item);
      }else{
        this.addItem(item);
      }
    },
    save:function(){
      this.data.updateTime=new Date().getTime();
      sessionStorage.setItem( "sprintShop-compare" , JSON.stringify(this.data));
    },
    hasSpace:function(){
      return this.data.items.length<this.COMPARE_SIZE;
    },
    isInclude:function(item){
      for(var i=0;i<this.data.items.length;i++){
        if(this.data.items[i].id==item.id){
          return true;
        }
      }
      return false;
    }
  };
  this.compareItems.init();
  this.setContext=function(key,parameter){
    parameter=parameter.replace("/","");
    if(key==pathMap._phones._hash){
      if(location.hash==phoneController.list.filter.urlHash.value){
        appUtil.refreshContent(true);
        return;
      }
      phoneController.status="init";
      appUtil.getData($http,"shop_get_phones_by_brand_id").success(function(data){
        phoneController.status="ready";
        phoneController.details.data={};
        phoneController.list.data=data.responses.response[0].getListPhonesResponse.phones.phone;
        phoneController.list.data=appUtil.toArray(phoneController.list.data);
        for(var i=0; i<phoneController.list.data.length; i++) {
          phoneController.scrubPhoneData(phoneController.list.data[i]);
        }
        phoneController.list.filter.init(phoneController.list.data, parameter);
        appUtil.refreshContent();
      }); 
    }else if(key==pathMap._phoneDetails._hash){
      phoneController.details.init(parameter);
    }else if(key==pathMap._phoneCompare._hash){
      phoneController.compareItems.init();
      appUtil.refreshContent();
    }
  };
  this.getRateStarClass=function(r){
    var v=""
    for(var i=0;i<r;i++){
      v+="★";
    }
    return v;
  };
  this.getDiscountClass=function(data){
    var discount=0;
    var name="";
    try{
      if(!data.selectedVariant.hiddenPrice){
        discount=parseInt(data.selectedVariant.discount*100)/100;
        if(discount){
          discount_name=(""+discount).replace("\.","_");
          name=".discount_"+discount_name+":before";
          appUtil.createStyleClass(name,"{content:\"$"+discount+" off!\" !important}");
          name=" onSale "+"discount_"+discount_name;
        }
      }
    }catch(e){
    }
    return name;
  }
  
  this.genie={
    data:[],
    pages:[],
    sort:"featured",
    lastSort:null,
    loadGenieList:function(){
      appUtil.getData($http,"shop_phone_get_genie").success(function(data){
        phoneController.genie.data=appUtil.simplifyObject(appUtil.toArray(data.responses.response[0].phoneGenieListResponse.phone));
        for(var i=0;i<phoneController.genie.data.length;i++){
          phoneController.scrubPhoneData(phoneController.genie.data[i])
        }
        phoneController.genie.getSortPages();
      }); 
    },
    getSortPages:function(){
      if(this.lastSort==this.sort){
        return this.pages;
      }
      this.lastSort=this.sort;
      phoneController.sortList(this.sort,this.data);
      var page=[];
      this.pages=[];
      for(var i=0;i<this.data.length;i++){
        if(i%3==0){
          page=[];
          this.pages.push(page);
        }
        page.push(this.data[i]);
      }
      return this.pages;
    }
  }
  this.genie.loadGenieList();
}]);