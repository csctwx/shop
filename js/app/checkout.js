(function() {
  var checkoutModule = angular.module('checkout-directives', []);
  var directiveSetting={
    moduleName:"checkout",
    items:"step1,item_list,delivery,promo_form,billing_form,payment_form,agreement,summary,summary_info,step2,promo_info,billing_info,payment_info,shipping_form,shipping_info,cancel,step3,step3_in_error,other_info,container,legal"
  };
  appUtil.buildModuleDirective(checkoutModule,directiveSetting);
})();

appModule.controller('checkoutController', ['$http','$scope', function($http,$scope){
  var checkoutController=this;
  this.step=0;
  this.dataOptions={
    shipping:[],
    creditCardYear:[
      new Date().getFullYear(),new Date().getFullYear()+1,new Date().getFullYear()+2,new Date().getFullYear()+3,new Date().getFullYear()+4,new Date().getFullYear()+5
    ],
    paymentCardType:[
      {id:"cc1",name:"DISCOVER"},
      {id:"cc2",name:"MASTER"},
      {id:"cc3",name:"VISA"},
      {id:"cc4",name:"PAYPAL"},
    ]
  }

  this.data={};
  this.changeStatus={};
  this.initData=function(){
    this.data={
      orderConfirmationNumber:"",
      error:false,
      errorText:"",
      promoCode:{
        value:null,
        status:-1, /* -1: not apply, 0: valid, others: invalid*/
        message:null
      },
      promoCodes:[],
      billingInfo:{
        firstName:null,
        lastName:null,
        address1:null,
        address2:null,
        city:null,
        zipCode:null,
        state:null,
        phoneNumber:null,
        email:null,
        validateEmail:null
      },
      shippingInfo:{
        firstName:null,
        lastName:null,
        address1:null,
        address2:null,
        city:null,
        zipCode:null,
        state:null,
        phoneNumber:null,
        email:null,
        validateEmail:null
      },
      shippingOption:null,
      paymentInfo:{
        CardType:"CREDIT",
        cardNumber:null,
        expirationMonth:null,
        expirationYear:null,
        securityCode:null,
        paymentCardType:null
      },
      equipments:[],
      agree:false,
      summary:{
        shipping:function(){
          if(checkoutController.data.shippingOption){
            return checkoutController.data.shippingOption.shippingFee;
          }
          return 0;
        },
        tax:function(){
          var tax=0;
          for(var i=0;i<checkoutController.data.equipments.length;i++){
            var item=checkoutController.data.equipments[i];
            if( item.equipmentTaxAmt ) {
              tax+=item.equipmentTaxAmt*item.quantity;
            }
          }
          return tax;
        },
        subtotal:function(){
          var subtotal=0;
          for(var i=0;i<checkoutController.data.equipments.length;i++){
            var item=checkoutController.data.equipments[i];
            subtotal+=item.modelPrice*item.quantity;
          }
          return subtotal;
        },
        total:function(){
          return Number(this.shipping())+Number(this.tax())+Number(this.subtotal());
        }
      }
    };
    this.changeStatus={};
    appUtil.initObjValue(this.data,this.changeStatus,"valueObj","changed",false);
  };
  this.initData();
  
  this.initPaymentInfo=function(){
    this.data.paymentInfo={
      CardType:"CREDIT",
      cardNumber:null,
      expirationMonth:null,
      expirationYear:null,
      securityCode:null,
      paymentCardType:null
    };
    appUtil.initObjValue(this.data.paymentInfo,this.changeStatus.paymentInfo,"valueObj","changed",false);
  }
  appUtil.getData($http,"shop_get_shipping_by_brand_id").success(function(data){
    data=appUtil.toArray(appUtil.simplifyObject(data.responses.response[0].shippingListResponse.shippingList.shipping));
    for(var i=0;i<data.length;i++){
      appUtil.rename(data[i],"shippingMethod","shippingOption");
      appUtil.rename(data[i],"shippingTypeCode","shippingType");
    }
    checkoutController.dataOptions.shipping=data;
    checkoutController.data.shippingOption=data[0];
  }); 
  this.cleanPromoStatus=function(){
    this.data.promoCode.status=-1;
    this.data.promoCode.message="";
  }
  this.applyPromoCode=function(){
    var data={
      promoCode:this.data.promoCode.value,
      equipments:[]
    };
    for(var i=0;i<this.data.equipments.length;i++){
      var d={
        modelId:this.data.equipments[i].sku,
        modelPrice:this.data.equipments[i].modelPrice,
        quantity:this.data.equipments[i].quantity
      }
      data.equipments.push(d);
    }
    appUtil.postData($http,"shop_validate_promo_code_service",data).
      success(function(data,status,headers,config){
        checkoutController.data.promoCode.status=data.status;
        checkoutController.data.promoCode.message=data.description;
      }).
      error(function(data,status,headers,config){
        checkoutController.data.promoCode.status=999;
        checkoutController.data.promoCode.message="Got a error in the apply processing.";
      });
  };
  
  this.copyShippingOptionData=function(data){
    data.shippingInfo.shippingOption=this.data.shippingOption.shippingOption;
    data.shippingInfo.shippingType=this.data.shippingOption.shippingType;
    data.shippingInfo.shippingFee=this.data.shippingOption.shippingFee;
    
  };
  this.doReviewOrder=function(){
    if(!this.data.billingInfo.address2){
      this.data.billingInfo.address2=null;
    }
    var data={
      billingInfo:angular.copy(this.data.billingInfo),
      shippingInfo:angular.copy(this.data.shippingInfo),
      paymentInfo:this.data.paymentInfo,
      equipments:[]
    };
    this.copyShippingOptionData(data);
    delete data.billingInfo.validateEmail;
    delete data.shippingInfo.validateEmail;
    
    for(var i=0;i<this.data.equipments.length;i++){
      var d={
        modelId:this.data.equipments[i].sku,
        modelPrice:this.data.equipments[i].modelPrice,
        orderLineId:i+1,
        accessoryInd:this.data.equipments[i].accessoryInd,
        quantity:this.data.equipments[i].quantity
      }
      data.equipments.push(d);
    }
    appUtil.postData($http,"shop_shipping_billing_service",data).
      success(function(data,status,headers,config){
        if(data.status==0){
          for(var i=0;i<data.equipments.length;i++){
            checkoutController.data.equipments[i].orderLineId=data.equipments[i].orderLineId;
            checkoutController.data.equipments[i].modelId=data.equipments[i].modelId;
            checkoutController.data.equipments[i].modelPrice=data.equipments[i].modelPrice;
            checkoutController.data.equipments[i].equipmentTaxAmt=data.equipments[i].equipmentTaxAmt;
            checkoutController.data.equipments[i].accessoryInd=data.equipments[i].accessoryInd;
            checkoutController.data.equipments[i].taxTransactionId=data.equipments[i].taxTransactionId;
            checkoutController.data.equipments[i].invoiceDate=data.equipments[i].invoiceDate;
            checkoutController.data.equipments[i].quantity=data.equipments[i].quantity;
            checkoutController.data.equipments[i].subTotalAmt=data.equipments[i].subTotalAmt;
            checkoutController.data.equipments[i].isPreOrder=data.equipments[i].isPreOrder;
          }
          $scope.cartController.save();
          checkoutController.data.transactionId=data.transactionId;
          checkoutController.data.orderId=data.orderId;
          checkoutController.data.CardType=data.CardType;
          checkoutController.data.paymentCardType=data.paymentCardType;
          checkoutController.data.shippingFee=data.shippingFee;
          checkoutController.data.totalAmt=data.totalAmt;
          checkoutController.step=2;
          window.scrollTo(0, 0);
        }else{
          if(data.description=="Order Amount is not valid"){
            checkoutController.data.errorText="Order Amount is not valid";
          }else if(data.paymentValid===undefined){
            checkoutController.data.errorText="Billing City, State, Zip Code combination does not exist";
          }else{
            checkoutController.data.errorText="Payment info is not valid";
          }
          $scope.showMessage(checkoutController.data.errorText,"error");
        }
      }).
      error(function(data,status,headers,config){
        $scope.showMessage("Payment service is not available","error");
//        alert("ERROR:"+JSON.stringify(data))
      });    
  };

  this.restartCheckout=function() {
    checkoutController.step=1;
  };
  
  this.doComplete=function(){
    var data={
      billingInfo:angular.copy(this.data.billingInfo),
      shippingInfo:angular.copy(this.data.shippingInfo),
      paymentInfo:this.data.paymentInfo,
      equipments:[],
      transactionId:this.data.transactionId,
      orderId:this.data.orderId
    };
    this.copyShippingOptionData(data);
    delete data.billingInfo.validateEmail;
    delete data.shippingInfo.validateEmail;

    for(var i=0;i<this.data.equipments.length;i++){
      var d={
        orderLineId:this.data.equipments[i].orderLineId,
        modelId:this.data.equipments[i].modelId,
        modelPrice:this.data.equipments[i].modelPrice,
        equipmentTaxAmt:this.data.equipments[i].equipmentTaxAmt,
        taxTransactionId:this.data.equipments[i].taxTransactionId,
        invoiceDate:this.data.equipments[i].invoiceDate,
        accessoryInd:this.data.equipments[i].accessoryInd,
        quantity:this.data.equipments[i].quantity,
        subTotalAmt:this.data.equipments[i].subTotalAmt,
        isPreOrder:this.data.equipments[i].isPreOrder
      }
      data.equipments.push(d);
    }
    appUtil.postData($http,"shop_complete_purchase_service",data).
      success(function(data,status,headers,config){
        checkoutController.step=3;
        if(data.status==0){
          checkoutController.finalData=angular.copy(checkoutController.data);
          checkoutController.finalData.confirmationNumber=data.fastOrderKey;
          checkoutController.orderComplete=data.orderComplete;
          checkoutController.finalData.subtotal=checkoutController.data.summary.subtotal();
          checkoutController.finalData.shipping=checkoutController.data.summary.shipping();
          checkoutController.finalData.tax=checkoutController.data.summary.tax();
          checkoutController.finalData.total=checkoutController.data.summary.total();
          $scope.cartController.clean();
          checkoutController.initData();
        }else{
          checkoutController.data.error=true;
          checkoutController.data.errorText=data.description;
          $scope.showMessage(data.description,"error");
        }
        window.scrollTo(0, 0);
      }).
      error(function(data,status,headers,config){
        checkoutController.data.errorText="Payment service is not available";
        $scope.showMessage(checkoutController.data.errorText,"error");        
      });    
  };

  this.cancelOrder=function(){
    $scope.cartController.clean();
    checkoutController.initData();
    $scope.showMessage("Your order has been cancelled.","info");
  };
  
  this.copyBillingInfoToShippingInfo=function(){
    this.data.shippingInfo.firstName=this.data.billingInfo.firstName;
    this.data.shippingInfo.lastName=this.data.billingInfo.lastName;
    this.data.shippingInfo.address1=this.data.billingInfo.address1;
    this.data.shippingInfo.address2=this.data.billingInfo.address2;
    this.data.shippingInfo.city=this.data.billingInfo.city;
    this.data.shippingInfo.zipCode=this.data.billingInfo.zipCode;
    this.data.shippingInfo.state=this.data.billingInfo.state;
    this.data.shippingInfo.phoneNumber=this.data.billingInfo.phoneNumber;
    this.data.shippingInfo.email=this.data.billingInfo.email;
    this.data.shippingInfo.validateEmail=this.data.billingInfo.validateEmail;
    appUtil.initObjValue(this.data,this.changeStatus,"valueObj","changed",true);
  };
  
  this.switchSynBillingShippingInfo=function(){
    if(this.data.shippingInfo==this.data.billingInfo){
      this.data.shippingInfo=angular.copy(this.data.shippingInfo);
    }else{
      this.data.shippingInfo=this.data.billingInfo;
    }
  }
  
  appUtil.getData($http,"zipcode_blacklist").success(function(data){
    try{
      checkoutController.blackZipCodes=","+data.responses.response[0].$+",";
    }catch(e){
      checkoutController.blackZipCodes=",,";
    }
  }); 
  this.isBlackZipcode=function(v){
    return v && checkoutController.blackZipCodes.indexOf(v)>=0;
  }
  this.setContext=function(key,parameter){
    checkoutController.step=1;
    checkoutController.data.equipments=$scope.cartController.data.items;
    this.initPaymentInfo();
    appUtil.refreshContent();
  };

}]);


