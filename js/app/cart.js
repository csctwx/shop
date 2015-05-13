(function() {
var cartModule = angular.module('cart-directives', []);
  cartModule.directive("cartRoom", function() {
    return {
      restrict: 'E',
      replace:true,
      templateUrl: "templates/cart/room.html?"+appUtil.appVersion
    };
  });
})();

appModule.controller('cartController', ['$http','$scope', function($http,$scope){
  this.config={
    PURCHASE_LIMITATION:3
  };
  this.data = JSON.parse(sessionStorage.getItem( "sprintShop-cart" ));
  if( this.data ) {
    if(!this.data.version==$scope.app.config.DATA_VERSION){
      this.data=null;
    }
  }
  if( !this.data ) {
    this.data = {items:[],version:$scope.app.config.DATA_VERSION,updateTime:new Date().getTime()};
  }
  this.addToCart=function(device){
    var item=null;
    var variant=device.selectedVariant;

    if( this.getTotalQuantity() == this.config.PURCHASE_LIMITATION ) {
      $scope.showMessage("You can only purchase maximum of "+this.config.PURCHASE_LIMITATION+" items at once.","warning");
      return;
    }
    
    for(var i=0;i<this.data.items.length;i++){
      var d = this.data.items[i];
      //I don't know why browser auto set the hashkey attribute, and it cause some problem.
      delete d.$$hashKey;
      
      if(d.sku==variant.sku){
        item=d;
        if(variant.purchaseLimit){
          if(item.quantity+1>variant.purchaseLimit){
            $scope.showMessage("You can only purchase maximum of "+variant.purchaseLimit+" "+item.brand+" "+item.name+" at once.","warning");
            return;
          }
        }
        item.quantity++;
      }
    }
    if(item==null){
      item={
        deviceId:device.id,
        name:device.name,
        brand:device.brand,
        sku:variant.sku,
        color:variant.color,
        memory:variant.memory,
        image:variant.gridImage,
        modelPrice:variant.price,
        accessoryInd:false,
        orderLineId:1,
        quantity:1,
        purchaseLimit:variant.purchaseLimit
      }
      this.data.items.push(item);
    }

    $scope.showMessage("Product added to your shopping cart.","info");
    this.save();
    appUtil.setUrlHash(pathMap._checkout._hash);
  };
  this.getTotalQuantity=function(){
    var v=0;
    for(var i=0;i<this.data.items.length;i++){
      v+=this.data.items[i].quantity;
    }
    return v;
  };
  this.removeItem=function(data){
    appUtil.removeItemFromArray(this.data.items,data);
    this.save();
  };
  this.setQuantity=function(item, n){
    item.quantity=n;
    this.save();
  };
  this.save=function(){
    sessionStorage.setItem( "sprintShop-cart" , JSON.stringify(this.data));    
    $("#synCartCount").html(this.getTotalQuantity());    
  };
  this.clean=function(){
    while(this.data.items.length>0){
      this.data.items.splice(0,1);
    }
    this.save();
  };
  this.getPhoneTitle=function(item,variant){
    var title = item.brand + " " + item.name;
    if(variant.color){
      title+= " (" + variant.color;
      if(variant.memory){
        title+=", "+variant.memory;
      }
      title+=")";
    }else if(variant.memory){
      title+=" ("+variant.memory+")";
    }
    return title;
  }
}]);
