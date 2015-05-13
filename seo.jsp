<html>
<head>
	<script src="js/lib/jquery.min.js"></script>
<script>
var seo={
  rootPage:null,
  webSite:location.protocol+"//"+location.host+"/"+location.pathname.split("/")[1],
  curPage:null,
  pageMap:{},
  generatePages:function(){
    this.rootPage=$("#path").val();
    this.loadPage(this.rootPage);
  },
  loadPage:function(v){
    if(v){
      $("#path").val(v);
      $("#seo")[0].src=v;
    }else if(this.isPageReady()){
      setTimeout("seo.storePage()",1000);
      return;
    }
    setTimeout("seo.loadPage()",1);
  },
  storePage:function(){
    var page={
      name:$("#seo")[0].contentWindow.location.hash,
      content:this.cleanPage($("#seo")[0].contentDocument.documentElement.outerHTML)
    }
    $("#pathName").val(page.name);
    $("#content").val(page.content);
    $("#mainForm")[0].submit();
    this.pageMap[page.name]="done";
    console.log("store page "+page.name)
    this.collectHash();
    this.collectNextPage();
  },
  collectHash:function(){
    var list=$("#seo")[0].contentWindow.$("a");
    for(var i=0;i<list.length;i++){
      var v=list[i].href;
      if(v.indexOf(this.webSite)==0 && v.indexOf("#!")>0){
        v="#!"+v.split("#!")[1];
        if(!this.pageMap[v]){
          console.log(v);
          this.pageMap[v]=null;
        }
      }
    }
  },
  cleanPage:function(v){
    while(v.indexOf("<script")>0){
      var i=v.indexOf("<script");
      var ii=v.indexOf("<\/script>");
      v=v.substring(0,i)+v.substring(ii+9);
    }
    return v;
  },
  collectNextPage:function(){
    var pageCount=0;
    var names="";
    for(var k in this.pageMap){
      pageCount++;
      names+=k+"\n";
      if(!this.pageMap[k]){
        this.loadPage(this.rootPage+k);
        return;
      }
    }
    alert("Complete "+pageCount+" pages!");
    alert(names);
  },
  isPageReady:function(){
    if($("#seo")[0].contentWindow.$ && $("#seo")[0].contentWindow.$("#loading")){
      return $("#seo")[0].contentWindow.$("#loading").css("display")=="none";
    }
    return false;
  }
}
</script>

</head>
<body>
<form method="GET" action="savePage" id="mainForm" target="postWindow">
  <input type="hidden" name="path" id="pathName"/>
  <input type="hidden" name="content" id="content"/>
</form>
<input id="path" value="index.html" style="width:50%"/>
<button onclick="seo.generatePages()">Go</button>
<iFrame id="seo" style="width:100%;height:100%" ></iFrame>
</body>
</html>