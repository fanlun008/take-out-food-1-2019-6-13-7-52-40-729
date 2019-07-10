function bestCharge(selectedItems) {

  let orderList = generateOrder(selectedItems);
  return getReceiptContent(orderList);
}

function generateOrder(selectedItems) {
  let orderList = [];
  selectedItems.forEach((item) => {
    let orderId = (item.split('x')[0]).trim();
    let orderCount = (item.split('x')[1]).trim();
    let theOrder = {};
    theOrder['id'] = orderId;
    theOrder['count'] = orderCount;
    orderList.push(theOrder);
  })

  return orderList;
}

function findDetailItemById(id) {
  let allItems = loadAllItems();
  return allItems.filter((value) => {
    return id === value['id'];
  })[0];
}

/**
 * 
 * @param {*} orderList 
 *  0: {id: "ITEM0001", count: "1"}
    1: {id: "ITEM0013", count: "2"}
    2: {id: "ITEM0022", count: "1"}
 */
function getReceiptContent (orderList) {

  let receiptContent = `============= 订餐明细 =============\n`;

  orderList.forEach((value)=> {
    let findItem = findDetailItemById(value['id']);
    receiptContent += `${findItem['name']} x ${value['count']} = ${findItem['price'] * value['count']}元\n`
  })

  receiptContent += `${checkBestPromotion(orderList)['promotionInfo'] == '' ? '-----------------------------------': checkBestPromotion(orderList)['promotionInfo']}
总计：${checkBestPromotion(orderList)['priceToCompare']}元
===================================`;

  return receiptContent;

}


/**
 * 
 * @param {*} orderList 
 *  0: {id: "ITEM0001", count: "1"}
    1: {id: "ITEM0013", count: "2"}
    2: {id: "ITEM0022", count: "1"}
 */
function checkBestPromotion(orderList) {
  let minPrice = -1;
  let priceToCompare = 0;
  let bastPromotionName = '';
  orderList.forEach((value) => {
    let findPromoteItem = findDetailItemById(value['id']);
    priceToCompare += findPromoteItem['price'] * value['count'];
  })

  let buy30save6_price = buy30save6(orderList);
  let half_price_price = half_price(orderList);

  if (buy30save6_price['finalPrice'] < priceToCompare){
    priceToCompare = buy30save6_price['finalPrice'];
    bastPromotionName = "buy30save6";
  }
  if (half_price_price['finalPrice'] < priceToCompare) {
    priceToCompare = half_price_price['finalPrice'];
    bastPromotionName = 'half_price';
  }

  let promotionInfo = '';
  if (bastPromotionName == 'buy30save6') {
    promotionInfo = `-----------------------------------
使用优惠:
满30减6元，省6元
-----------------------------------`
  }
  if(bastPromotionName == 'half_price') {
    promotionInfo = `-----------------------------------
使用优惠:
指定菜品半价(${half_price_price['canSaveName'].join('，')})，省${half_price_price['savePrice']}元
-----------------------------------`
  }
  return {'promotionInfo':promotionInfo, 'priceToCompare': priceToCompare};

}


function buy30save6(orderList) {
  let finalPrice = 0;
  let flag = false;
  orderList.forEach((value) => {
    let findPromoteItem = findDetailItemById(value['id']);
    finalPrice += findPromoteItem['price'] * value['count'];
  })
  if(finalPrice >= 30) {
    finalPrice-=6;
    flag = true;
  }
  return {'flag': flag, 'finalPrice': finalPrice};
}



/**
 * 
 * @param {*} orderList 
 *  0: {id: "ITEM0001", count: "1"}
    1: {id: "ITEM0013", count: "2"}
    2: {id: "ITEM0022", count: "1"}
 */
function half_price(orderList) {
  let finalPrice = 0;
  let savePrice = 0;
  let canSaveName = [];

  let allPromotions = loadPromotions();
  let halfPrice_Item;                       //["ITEM0001", "ITEM0022"]
  for (let promo of allPromotions) {
    if(promo['type'] == '指定菜品半价') {
      halfPrice_Item = promo['items']
    }
  }
  orderList.forEach((value) => {
    let findPromoteItem = findDetailItemById(value['id']);
    if (isInArray(value['id'], halfPrice_Item)) {
      canSaveName.push(findPromoteItem['name']);
      finalPrice += findPromoteItem['price']/2 * value['count']
      savePrice += findPromoteItem['price']/2 * value['count']
    } else {
      finalPrice += findPromoteItem['price'] * value['count']
    }
  })
  return {'finalPrice': finalPrice, 'savePrice':savePrice, 'canSaveName':canSaveName};
}

function isInArray(id, idArr) {
  let flag = false
  idArr.forEach((value)=> {
    if(id == value) {
      flag = true;
    }
  })
  return flag;
}