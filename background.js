var prev = 0;
var loggedStatus = false;

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.id === "updateBadge"){
      console.log("msg received");
      retrieveSales(prev);
}});

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.id === "logoutBadge"){
      updateBadge("logout");
      sendResponse({farewell: "Badge updated"});
}});

function updateBadge(data){
  if (data==="logout"){
    loggedStatus = false;
    chrome.action.setIcon({path:"images/icon32_bw.png"})
    chrome.action.setBadgeText({text:"0"});
    chrome.action.setBadgeBackgroundColor({color:[160,160,160,1]});
    }
  else{
    loggedStatus = true;
    chrome.action.setIcon({path:"images/icon32.png"});
    chrome.action.setBadgeBackgroundColor({color:[19, 93, 145, 1]}); //(19, 93, 145, 1)
    chrome.action.setBadgeText({text:(""+data)}); //
  }
}

chrome.runtime.onInstalled.addListener (function (details) {
  console.log("installed")
  chrome.action.setBadgeText({text:"0"});
  chrome.action.setBadgeBackgroundColor({color:[19, 93, 145, 1]});
  chrome.alarms.create("salesAlarm", {periodInMinutes: 1}); //, periodInMinutes: 0.1
});

chrome.alarms.onAlarm.addListener((alarm) => {
  retrieveSales(prev);
});

async function retrieveSales(prev) {
  url=getUrl();
  fetch(url)
  .then(response => {
    if (response.redirected) {
      updateBadge("logout");
      resolve(false);
    }
    else{
      return response.text()
    }})
    .then(response => {
    var strippedHtml = response.replace(/<[^>]+>/g, '');
    var count = parseInt(getSalesCount(strippedHtml));
    if (isNaN(count)){
      count=0;
    }
    if (count>=prev){
      //************************************* NEW SALE SOUND
      prev=count;
      updateBadge(count.toString());
    }
  })
}


function getSalesCount(salesTxt){
  let sub = salesTxt.split('Showing ').pop().split(' results')[0];
  let count = sub.substring(sub.indexOf('f') + 2);
  return count
}

 function getUrl() {
  var date = getTodaysDate();
  let mm = date[0]; let dd = date[1]; let yyyy = date[2];
  var url = "https://www.teacherspayteachers.com/My-Sales?source=Overall&start_date=" + mm + "%2F" + dd + "%2F"+ yyyy + "&end_date="+ mm +"%2F"+ dd +"%2F"+ yyyy;
  return url 
}


function getTodaysDate(mode){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  let date= [];
  date.push(mm);date.push(dd);date.push(yyyy);
  return date
}

