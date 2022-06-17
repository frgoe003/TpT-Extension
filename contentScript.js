
console.log('you\'r in the world of content.js');



chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if (message.id === "checkSales"){
        console.log("request received")
        retrieveSales();
      }
    }
  );
  




  async function retrieveSales() {

    url="https://www.teacherspayteachers.com/My-Sales";
  
    fetch(url).then(response => {
      if(response.status === 200){
        return response.text();
      }throw new Error("Status != 200");
    }).then((reponseText) => {
      body = extractContent(reponseText);
      salesMatrix = extractSales(body);
      console.log(body);
    }).catch((error) => {
      console.log(error); //DISPLAY LOGGED OUT
    });
  }
  function extractContent(str) {
    var parser = new DOMParser();
      var doc = parser.parseFromString(str, 'text/html');
    var body = doc.querySelectorAll(".odd, .even");
      return body;
  };
  
  function extractSales(NodeList){
    const len = NodeList.length;
    let salesList = [];let dateList = [];let earningsList = []; let itemList = [];
    for (let i=0; i<len;i++){
      curr = NodeList.item(i);
      date = curr.cells.item(0).innerHTML;
      itemSold = getItemSold(i);
      sale = curr.cells.item(6).innerHTML;
      earnings = curr.cells.item(11).innerText.replace(/[^.0-9$]/g,"");
      salesList.push(sale); 
      dateList.push(date); 
      earningsList.push(earnings);
      itemList.push(itemSold);
    }
    salesMatrix=[dateList,itemList,salesList,earningsList];
    //updateSalesTable(salesMatrix);
  
    chrome.runtime.sendMessage({id: "salesData", data:salesMatrix });
  
    return salesMatrix;
  }
  function getItemSold(i){
    return "TestItem"
  }

function getTodaysDate(mode){
    if (mode=="testMode"){
      return "06/02/2022"
    }
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
  
    today = mm + '/' + dd + '/' + yyyy;
    return today
}
  
  
  