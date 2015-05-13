var pathMap=({
  home:{
    _title:"Home",
    _controller:"app",
    _metaTitle:"Prepaid Phones & No Contract Phones from Sprint Prepaid",
    _metaDescription:"Find all your favorite phones without the hassle of a contract. Get savings without sacrificing your network and choose Sprint Prepaid.",
    _metaKeywords:"prepaid phones, no contract phones, sprint prepaid",
    shop:{
      _title:"Shop",
      _controller:"app",
      _metaTitle:"Sprint Prepaid No Contract Plans & Phones",
      _metaDescription:"Shop Sprint Prepaid for no contract phone plans, smartphones at great prices and nationwide coverage.",
      _metaKeywords:"no contract plans, prepaid cell phones, nationwide coversage, sprint prepaid",
      phones:{
        _title:"Phones",
        _controller:"phoneController",
        _metaTitle:"No Contract Cell Phones & Smartphones from Sprint Prepaid",
        _metaDescription:"Sprint Prepaid has great cell phone options including iPhones and Android phones. Get that new phone on your list without worrying about a contract.",
        _metaKeywords:"prepaid cell phones, prepaid smartphones, no contract cell phones, no contract smartphones",
        _match:function(hash){
          if(hash==this._hash){
            return true;
          }else if(hash.indexOf(this._hash)!=0){
            return false;
          }
          var v = hash.replace(this._hash,"").split("/")[0];
          return v!="details" && v!="compare";
        },
        details:{
          _controller:"phoneController",
          _shortcut:"phoneDetails",
          _metaTitle:"No Contract Cell Phones & Smartphones from Sprint Prepaid",
          _metaDescription:"Sprint Prepaid has great cell phone options including iPhones and Android phones. Get that new phone on your list without worrying about a contract.",
          _match:function(hash){
            return hash.indexOf(this._hash)==0 && hash.replace(this._hash,"").split("/").length<=2;
          },
          _setMetas:function(para){
            if(!para){
              para="";
            }else{
              para=para.replace("/"," ");
            }
            appUtil.setMetaInfo("title",this._metaTitle+" - "+para);
            appUtil.setMetaInfo("description",this._metaTitle+ " for "+para);
            appUtil.setMetaInfo("keywords",this._metaTitle+" "+para);
          }
        },
        compare:{
          _title:"Compare",
          _metaTitle:"Sprint - Compare",
          _metaKeywords:"",
          _metaDescription:"Sprint Compare",
          _controller:"phoneController",
          _shortcut:"phoneCompare"
        }
      },
      checkout:{
        _title:"Checkout",
        _metaTitle:"Sprint - Checkout",
        _metaKeywords:"Sprint Checkout",
        _metaDescription:"",
        _controller:"checkoutController"
      }
    },
    plan:{
      _title:"Plan",
      _controller:"app",
      _metaTitle:"No Contract & Prepaid Phone Plans from Sprint Prepaid",
      _metaDescription:"See how much you can save by choosing a no contract phone plan from Sprint Prepaid. Get the same great network without the hassle of a contract.",
      _metaKeywords:"prepaid phone plans, prepaid cell phone plans, no contract phone plans, no contract cell phone plans"
    },
    page:{
      _title:"",
      _controller:"pageController",
      _match:function(hash){
        return hash.indexOf(this._hash)==0;
      },
      _generateExtendTitle:function(ps){
        this._extendTitle= appUtil.htmlToText(appUtil.keyToTitle(ps[ps.length-1]));
      },
      _setMetas:function(para){
        para=para.replace("/","");
        if(para=="additionalServices"){
          appUtil.setMetaInfo("title","Sprint - Additional Services");
          appUtil.setMetaInfo("description","Sprint Additional Services");
          appUtil.setMetaInfo("keywords","Sprint Additional Services");
        }else{
          appUtil.setMetaInfo("title","Sprint - Home");
          appUtil.setMetaInfo("description","Sprint");
          appUtil.setMetaInfo("keywords","Sprint");
        }
      }
    },
    banner:{
      _title:"banner",
      _controller:"pageController",
      _match:function(hash){
        return hash.indexOf(this._hash)==0;
      },
      _generateExtendTitle:function(ps){
        this._extendTitle= "";
      }
    },
    nextversion:{
      _controller:"nextversionController"
    }
  },
  _getCurPath:function(){
    if(location.hash==this._cacheHash){
      return this._cachePath;
    }
    this._cacheHash=location.hash;
    this._cachePath=[];
    var hash=location.hash.replace("#","").replace("!","").split("/");
    var lastNode=this;
    for(var i=0;i<hash.length;i++){
      var h=hash[i];
      if(h){
        var n=lastNode[h];
        
        if(n){
          this._cachePath.push(n);
          lastNode=n;
        }else{
          if(lastNode._generateExtendTitle){
            if(!hash[hash.length-1]){
              hash.splice(hash.length-1);
            }
            lastNode._generateExtendTitle(hash.splice(i));
          }else{
            lastNode._extendTitle=(lastNode._title?", ":"")+h;
          }
          break;
        }
      }
    }
    if(this._cachePath.length==0 || !this._cachePath[0]._hash){
      appUtil.setUrlHash(this._home._hash);
    }
    return this._cachePath;
  },
  _triggerApp:function(){
    try{
      angular.element("#appController").scope().assignContext(location.hash);
    }catch(e){
      setTimeout("pathMap._triggerApp()",10);
    }
    //for hidding menu on small screen.
    $(document).click();    
  },
  _init:function(){
    this._tmpShortcut={};
    this._hash="#!/";
    this._build(this,this);
    for(var k in this._tmpShortcut){
      this[k]=this._tmpShortcut[k];
    }
    delete this._tmpShortcut;
    return this;
  },
  _build:function(map,node){
    for(var k in node){
      if(k.indexOf("_")!=0){
        node[k]._hash=node._hash+k+"/";
        var shortcut="_"+(node[k]._shortcut || k);
        if(map._tmpShortcut[shortcut]){
          alert("Parse error! Duplicate short-cut,"+shortcut+" in pathMap setting.");
        }else{
          map._tmpShortcut[shortcut]=node[k];
        }
        if(!node[k]._match){
          node[k]._match=function(hash){
            return hash==this._hash;
          };
        }
        node[k]._setContext=function(hash){
          if(this._match(hash)){
            var key=this._hash;
            var para=hash.replace(key,"");
            if(this._setMetas){
              this._setMetas(para);
            }else{
              appUtil.setMetaInfo("title",this._metaTitle);
              appUtil.setMetaInfo("description",this._metaDescription);
              appUtil.setMetaInfo("keywords",this._metaKeywords);
            }
            var scope=angular.element("#appController").scope();
            if(eval("scope."+this._controller+".setContext")){
              eval("scope."+this._controller+".setContext(key,para);");
            }else{
              appUtil.refreshContent();
            }
            return true;
          }
          for(var kk in this){
            if(kk.indexOf("_")!=0 && kk.indexOf("$")!=0){
              if(this[kk]._setContext(hash)){
                return true;
              }
            }
          }
          
          return false;
        };
        this._build(map,node[k]);
      }
    }
  }
})._init();