var API = {
	gateway: 'https://edrington.shop/api', // 域名

//	gateway: 'http://dtc.ocheng.me/api', // 域名

  login: '/member/front/auto/login/', // 自动登录
  
  getOpenId: '/member/front/getOpenid', //获取openid

  productList: '/product/productInfo/lists', // 商品列表
  
  productPrivateList: '/product/productInfo/private/lists', //private 商品列表

  cityList: '/order/city/list/', // 城市列表  id = 1  默认请求省列表

  memberInfo: '/member/front/find/member/', // 获取个人信息

  tagList: '/member/front/tag/system/', // 获取标签列表

  createAddress: '/member/app/create/member/address', // 添加收货地址

  addressList: '/member/app/find/member/address/', // 收货地址列表

  createInvoice: '/member/app/create/member/invoice',  // 创建发票

  invoiceList: '/member/app/find/member/invoice/',   //发票列表

  shopCartList: '/order/query/shopping/cart', //购物车列表

  addGood: '/order/add/shopping/cart', //加入购物车

  orderList: '/order/query/order/list',  // 订单列表
  
  allOrderList: '/order/private/query/all/order/list', //所有订单列表
  
  deleteGood: '/order/delete/shopping/cart/batch', //删除购物车订单
  
  productInfo:'/product/productInfo/', //商品详情
  
  productInfoPrivate: '/product/productInfo/private/detail/',  //{id} 商品详情
  
  updateOrderCount: '/order/update/shopping/cart/counts', //修改购物车单个商品数量
  
  brandList: '/product/productInfo/brand/list', //品牌接口  ?companyId=36
  
  categoryList: '/product/productInfo/category/tree', //产品分类

  defaultAddress: '/member/app/update/member/address/default',  // 修改默认地址

  deleteAddress: '/member/app/delete/member/address/',    // 删除地址

  addressInfo: '/member/app/get/address/',     // 地址信息

  updateAddress: '/member/app/update/member/address/info',  // 更新地址

  submitOrder: '/order/submit/order/online',  //提交订单接口
  
  productInfoList: '/product/productInfo/productList', //查询多个商品详情

  deleteInvoice: '/member/app/update/member/invoice/status/',  //删除发票

  defaultInvoice: '/member/app/update/member/invoice/default',  //更新默认发票
  
  getDefaultInvoice: '/member/app/get/default/invoice/', //查询默认发票
  
  getDefaultAddress: '/member/app/get/default/address/', //查询默认地址

  invoiceInfo: '/member/app/get/address/invoice/',     // 发票信息

  updateInvoice: '/member/app/update/member/invoice/info',  // 更新发票
  
  shopCartCounts: '/order/query/member/shopping/cart/counts', //查询购物车订单数量

  updateMember: '/member/front/update/member/wx',   // 更新用户
  
  updateOrderStatus: '/order/update/order/status/', // 更改订单状态  /{id}/{status}
  
  cancelOrder: '/order/private/cancel/order', // private 取消订单
   
  getOrderByOrderNum: '/order/app/get/order/info/',   //根据订单编号查询订单信息
  
  orderPay: '/payment/pay',  //订单支付
  
  getAddressById: '/member/app/get/address/', //根据id查询地址
  
  getInvoiceById: '/member/app/get/address/invoice/', //根据id查询发票
  
  onlineOrder: '/order/update/online/order',  //订单确认
  
  getExpress: '/order/get/express/info/online/', //{id}  获取物流信息

  getDtcInfo: '/company/employeeController/front/selectByPrimaryKey/' //获取销售信息
}