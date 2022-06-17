// Initialize button with users's preferred color
let popupList = document.getElementById("list");
let salesTable = document.getElementById("salesTable");
let todaysEarnings = document.getElementById("todaysEarnings");
let todaysCircle = document.getElementById("todaysCircle");
let weeklyEarnings = document.getElementById("weeklyEarnings");
let weeklyCircle = document.getElementById("weeklyCircle");
let monthlyEarnings = document.getElementById("monthlyEarnings");
let monthlyCircle = document.getElementById("monthlyCircle");
let imageInput = document.getElementById("image");
let nameInput = document.getElementById("name");

startup();
chrome.runtime.sendMessage({id:"updateBadge"});

window.addEventListener('click',function(e){
  if(e.target.href!==undefined){
    chrome.tabs.create({url:e.target.href})
  }
})

/* TO DO 
-check if logged out -> update popup html
-remove unnecessary permissions from manifest
misc:

*/

function startup(){
  getHeader();
  retrieveSales(getUrl("month"),"month");
  retrieveSales(getUrl("week"),"week");
  retrieveSales(getUrl());
}

function getHeader() {
  url="https://www.teacherspayteachers.com/Dashboard"
  fetch(url).then(response => {
    if(response.status === 200){
      return response.text();
    }throw new Error("Status != 200");
  }).then((responseText) => {
    var parser = new DOMParser();
    var doc = parser.parseFromString(responseText, 'text/html');
    img = doc.getElementsByClassName("Avatar__img Avatar__img--medium");
    imgUrl = img.item(0).src;
    seller = doc.getElementsByClassName("SellerDashboard__storeName");
    sellerName = seller.item(0).innerText;
    nameInput.innerHTML=sellerName;
    imageInput.src=imgUrl;
  }).catch((error) => {
    console.log(error);
  });

}


async function retrieveSales(url,mode) {

  fetch(url).then(response => {
    if(response.status === 200){
      return response.text();
    }throw new Error("Status != 200");
  }).then((responseText) => {
    
    arr = extractContent(responseText);
    table=arr[0];totals=arr[1];
    salesMatrix = extractSales(table);

    if (!totals.item(1)){
      earnings="0";
    } else{
    earnings=totals.item(1).innerText.replace(/[^.0-9$]/g,"");
    }
    switch(mode){
      case "week":
        updateTotals(earnings,"week"); break
      case "month":
        updateTotals(earnings,"month");
        salesMatrix= extractSales(table);
        updateSalesTable(salesMatrix); break
      default:
        updateTotals(earnings,"tdy");
    }

  }).catch((error) => {
    console.log(error);
  });

}

function extractContent(str) {
  let arr =[];
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  var totals = doc.querySelectorAll(".amount");
  var table = doc.querySelectorAll(".odd, .even");
  arr.push(table);arr.push(totals);
  return arr
    
};

function extractSales(NodeList){

  const len = NodeList.length;
  let dateList = [];let salesList = []; let earningsList = []; let itemList = [];

  for (let i=0; i<len;i++){
    curr = NodeList.item(i);
    date = curr.cells.item(0).innerHTML;
    s= curr.cells.item(2).textContent;
    itemSold = s.substring(98,112).replace(/[ ]/g,"")+"..."; //.substring(31,41)
    sale = curr.cells.item(6).innerHTML; 
    earnings = curr.cells.item(11).innerText.replace(/[^.0-9$]/g,"");
     
    dateList.push(date);
    salesList.push(sale);
    earningsList.push(earnings);
    itemList.push(itemSold);
    if (i==2){
      break
    }
  }
  salesMatrix=[dateList,itemList,earningsList]; //salesList,
  return salesMatrix
}

function updateSalesTable(salesMatrix){
  for (let i=0; i<3;i++){
    var row = document.createElement("div");
    row.classList.add("row");
    for (let j=0;j<=2;j++){
      var cell = document.createElement('div');

      switch (j){
        case 0:
          cell.classList.add('col-4','themed-grid-col'); break
        case 1:
          cell.classList.add('col-4','themed-grid-col'); break
        case 2:
          cell.classList.add('col-4','themed-grid-col');
      }
      cell.innerHTML = salesMatrix[j][i];
      row.appendChild(cell);
  } salesTable.appendChild(row);
}}

function updateTotals(earnings,mode){

  switch(mode){
    case "week":
      weekly=parseFloat(earnings.replace("$",""));
      weeklyEarnings.innerHTML = "$"+weekly;
      var percentage = parseInt(getDecimalPart(weekly));
      weeklyCircle.className = "ecircle c100 p"+ percentage +" small green";
      break
    case "month":
      monthly=parseFloat(earnings.replace("$",""));
      monthlyEarnings.innerHTML = "$"+monthly;
      var percentage = parseInt(getDecimalPart(monthly));
      monthlyCircle.className = "ecircle c100 p"+ percentage +" small green"; 
      break
    default:
      todays=parseFloat(earnings.replace("$",""));
      todaysEarnings.innerHTML = "$"+todays;
      var percentage = parseInt(getDecimalPart(todays));
      todaysCircle.className = "ecircle c100 p"+ percentage +" small green";
  }
}

function getUrl(mode){
  var date = getDate(mode);
  var url = "https://www.teacherspayteachers.com/My-Sales?source=Overall&start_date=" + date[0] + "%2F" + date[1] + "%2F"+ date[2] + "&end_date="+ date[3] +"%2F"+ date[4] +"%2F"+ date[5];
  return url 
}

function getDate(mode){
  let arr=[];
  var date = new Date();
  var pastDate = date.getDate() - 7;
  date.setDate(pastDate);
  var pwd = String(date.getDate()).padStart(2, '0');
  var pwm = String(date.getMonth() + 1).padStart(2, '0');
  var pwyyy = date.getFullYear();
  var date = new Date();
  var pastDate = date.getDate() - 30;
  date.setDate(pastDate);
  var pmd = String(date.getDate()).padStart(2, '0');
  var pmm = String(date.getMonth() + 1).padStart(2, '0');
  var pmyyy = date.getFullYear();
  var date = new Date();
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0');
  var yyyy = date.getFullYear();

  switch(mode){
    case "week":
      arr.push(pwm);arr.push(pwd);arr.push(pwyyy);arr.push(mm);arr.push(dd);arr.push(yyyy);  
      break;
    case "month":
      arr.push(pmm);arr.push(pmd);arr.push(pmyyy);arr.push(mm);arr.push(dd);arr.push(yyyy);
      break
    default:
      arr.push(mm);arr.push(dd);arr.push(yyyy);arr.push(mm);arr.push(dd);arr.push(yyyy);
  }
  return arr
}


function getDecimalPart(num) {
  if (Number.isInteger(num)) {
    return 0;
  }
  const decimalStr = num.toString().split('.')[1];
  if (decimalStr.length>2){
    const sub = decimalStr.substring(0,2);
    return sub
  }
  if (decimalStr.length===1){
    return decimalStr+"0"
  }
  return decimalStr;
}


function createTxt(string){
  var link = document.createElement('a');
  link.download = 'data.json';
  var blob = new Blob([string], {type: 'text/plain'});
  link.href = window.URL.createObjectURL(blob);
  link.click();
}
function updateList(){
  listItem = document.createElement('li');
  listItem.innerHTML = sales[i];
  popupList.appendChild(listItem);
}




