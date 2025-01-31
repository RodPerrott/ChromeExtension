import ActiveTab from './activetab.js';
import RaceUpdate from './raceupdate.js';

const TAB_RACING = 'https://www.tab.com.au';
const ONE_SECONDS_MS = 1 * 1000;
let webSocket = null;

var activeWindowId = 0;
var pingTimer = 0;
var activeTabs = [];

// Active Tab States
const Idle = 0;
const GetRaceInfo = 1;
const GetRace = 2;
const ClickExacta = 3;
const ClickApproximates = 4;
const GetExacta = 5;
const ClickWinPlace = 6;

// Race Updates
const RaceInfoUpdated = 0;
const RaceUpdated = 1;
const ExactaUpdated = 2;



//chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

chrome.tabs.onCreated.addListener(function (tab) {
  console.log('New Tab Created : ' + tab.id + " Window Id : " + tab.windowId);
  if (tab.windowId == activeWindowId) {
    AddActiveTab(tab.id);
  }
});

chrome.tabs.onAttached.addListener(async function (tabId, attachInfo) {
  console.log('Tab Attached : ' + tabId + " Window Id : " + attachInfo.newWindowId);

  if (attachInfo.windowId == activeWindowId) {
    AddActiveTab(tab.id);
  }
});


chrome.tabs.onDetached.addListener(async function (tabId, attachInfo) {

  console.log('Tab Detached : ' + tabId + " Window Id : " + attachInfo.newWindowId);

  if (attachInfo.newWindowId == activeWindowId) {
    RemoveActiveTab(tabId);
  }
});

chrome.tabs.onRemoved.addListener(async function (tabId, removeInfo) {
  console.log('Tab Removed : ' + tabId + " Window Id : " + removeInfo.windowId);

  if (removeInfo.windowId == activeWindowId) {
    RemoveActiveTab(tabId);
  }
  else
    console.log('Tab From Id - Not Active Window');

});

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  pingTimer = 10;
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  pingTimer = 10;
});

/*
// Get Tab from tabId
async function getTabFromId(tabId) {
  console.log('GetTabfromId Id : ' + tabId);
  const allTabs = await chrome.tabs.query({});

  console.log('GetTabfromId AllTabs : ' + allTabs.length);

  allTabs.forEach((tab) => {
    console.log('GetTabfromId Checking : ' + tab.id);
    if (tab.id == tabId) {
      console.log('GetTabfromId :  Found)');
      return tab;
    }
  });
  console.log('GetTabfromId :  No Found)');
  return null;
}
  */

function AddActiveTab(tabId) {
  var activeTab = new ActiveTab(tabId);
  activeTabs.push(activeTab);

  console.log(activeTabs.length + ' Activate Tabs');
}

function TabIdExists(tabId) {
  //console.log('TabIdExists searching for ' + tabId);
  //console.log('TabIdExists checking ' + activeTabs.length);
  //console.log('TabIdExists checking actual ' + activeTabs[0]);

  var found = false;
  if (activeTabs) {
    activeTabs.forEach((activeTab) => {
      //console.log('TabIdExists checking ' + activeTab);
      if (activeTab.TabId === tabId) {
        found = true;
      }
    });
  }
  //console.log(tabId + ' found ' + found);
  return found;
}

function RemoveActiveTab(tabId) {
  console.log('RemoveActiveTab Tabs');
  if (activeTabs) {

    var index = 0;
    var tabIndex = 0;
    var found = false;
    activeTabs.forEach((activeTab) => {
      if (activeTab.TabId == tabId) {
        console.log('RemoveActiveTab Tabs Id = ' + activeTab);
        found = true;
        tabIndex = index;
      }
      else
        index++;
    });
    if (found) {
      console.log('RemoveActiveTab Found ');
      activeTabs.splice(tabIndex, 1);  // remove from array
      console.log(activeTabs.length + ' Activate Tabs');
    }
  }
}

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  if (url.origin === TAB_RACING) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true
    });

  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});




/*
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
console.log('Url : onUpdated');
if (!tab.url) return;
const url = new URL(tab.url);
console.log('Url : ' + url.origin);
// Enables the side panel on tab.com.au/racing
if (url.origin === TAB_RACING) {
  console.log('Url : Macthed');
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'sidepanel.html',
    enabled: true
  });
} else {
  console.log('Url : Not Macthed');
  // Disables the side panel on all other sites
  await chrome.sidePanel.setOptions({
    tabId,
    enabled: false
  });
}
});
*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "connect") {
    console.log('service-worker Connect');

    chrome.windows.getCurrent(async function (window) {
      console.log('Current Window is : ' + window.id);
      activeWindowId = window.id; // store the window where service is activated

      activeTabs = [];
      const allTabs = await chrome.tabs.query({});
      allTabs.forEach((tab) => {

        if (tab.windowId == activeWindowId) {
          var activeTab = new ActiveTab(tab.id);
          activeTabs.push(activeTab);
        }
      });
      console.log(activeTabs.length + ' Activate Tabs');

    });

    if (webSocket) {
      disconnect();

    } else {
      connect();
      keepAlive();
    }
  };
});

// It is called when non tab
//chrome.action.onClicked.addListener(async () => {
//  console.log('service-worker onClicked');
//  if (webSocket) {
//    disconnect();
//  } else {
//    connect();
//    keepAlive();
//  }
//});

//chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//  if (request.action === "scrape") {
//    const titles = document.querySelectorAll('header'); // Example: Scrape all <h1> elements
//    const scrapedData = Array.from(titles).map(title => title.textContent);
//    sendResponse({ data: scrapedData.join('\n') });
//  }
//});

function connect() {
  //webSocket = new WebSocket('wss://chrome-extension-websockets.glitch.me/ws');
  webSocket = new WebSocket('ws://localhost:8000/RaceData');

  webSocket.onopen = () => {
    chrome.action.setIcon({ path: 'icons/socket-active.png' });
  };

  webSocket.onmessage = (event) => {
    console.log(event.data);
  };

  webSocket.onclose = () => {
    chrome.action.setIcon({ path: 'icons/socket-inactive.png' });
    console.log('websocket connection closed');
    webSocket = null;

  };
  pingTimer = 10;
}

function disconnect() {
  if (webSocket) {
    webSocket.close();
    pingTimer = 0;
  }
}


function keepAlive() {
  /*
  const keepAliveIntervalId = setInterval(
    () => {

      OneSecondPoll();
      if (webSocket) {
        console.log('ping');
        webSocket.send('ping');
        PollTab();
      } else {
        clearInterval(keepAliveIntervalId);
      }
    },
    // It's important to pick an interval that's shorter than 30s, to
    // avoid that the service worker becomes inactive.
    ONE_SECONDS_MS
  );
  */
}

const intervalID = setInterval(OneSecondPoll, 1000);

function OneSecondPoll() {

  if (pingTimer != 0) {
    pingTimer--;
    if (pingTimer == 0) {
      pingTimer = 10;

      if (webSocket) {
        webSocket.send('ping');
      }
      else {

        if ((activeTabs) && (activeTabs.length > 0)) {
          connect();
        }
      }
    }
    if (webSocket)
      PollTabs();
  }
}



async function PollTabs() {

  if (activeTabs) {
    activeTabs.forEach(async (activeTab) => {
      if (activeTab.Timer != 0)
        activeTab.Timer--;
      if (activeTab.Timer == 0) {
        activeTab.Timer = 5;
        var tab = await GetTab(activeTab.TabId);
        if (tab)
          PollTab(activeTab, tab)
      }
    });
  }
}

async function GetTab(tabId) {
  const allTabs = await chrome.tabs.query({});
  var tabFound = null;
  allTabs.forEach((tab) => {
    if (tab.id === tabId)
      tabFound = tab;
  });
  return tabFound;
}

function CompareOdds(newRace, race) {

  var scratched = true;
  var toteOdds = true;
  var fixedOdds = true;
  if (newRace.Scratched.length == race.Scratched.length) {
    for (var index = 0; index < newRace.Scratched.length; index++) {
      if (newRace.Scratched[index] !== race.Scratched[index]) {
        scratched = false;
        console.log("CompareOdds : New Scrathing");
      }
    }
  } else {
    scratched = false;
    console.log("CompareOdds : Scrathing - Missmatch");
  }

  if (newRace.Win.length == race.Win.length) {
    for (var index = 0; index < newRace.Win.length; index++) {
      if (newRace.Win[index] !== race.Win[index]) {
        toteOdds = false;
        console.log("CompareOdds : Tote Odds Updated");
      }
    }
  } else {
    toteOdds = false;
    console.log("CompareOdds : ToteOdds - Missmatch");
  }
  if (newRace.FixedWin.length == race.FixedWin.length) {
    for (var index = 0; index < newRace.FixedWin.length; index++) {
      if (newRace.FixedWin[index] !== race.FixedWin[index]) {
        fixedOdds = false;
        console.log("CompareOdds : Fixed Odds Updated");
      }
    }
  }
  else {
    fixedOdds = false;
    console.log("CompareOdds : FixedOdds - Missmatch");
  }

  if (scratched && toteOdds && fixedOdds)
    return true;
  else
    return false;
}

function CompareExactas(newExactas, exactas) {

  var matched = true;
  if (newExactas.length == exactas.length) {
    for (var index = 0; index < newExactas.length; index++) {
      if (newExactas[index].Pay !== exactas[index].Pay)
        matched = false;
    }
  }
  else
    matched = false;

  return matched;
}



async function PollTab(activeTab, tab) {
  const zeroPad = (num, places) => String(num).padStart(places, '0')

  var courseName = ''
  var raceNo = 0;
  var raceStatus = '';

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  month++;
  var day = date.getDate();
  const today = year + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2);
  if (tab.url.includes('https://www.tab.com.au/racing/' + today)) {

    switch (activeTab.TabState) {
      case Idle:
        break;
      case GetRaceInfo:
        // Get CourseName, RaceNo, RaceStatus

        activeTab.TabState = GetRace;  // Next Task

        console.log("State : Race Info");

        chrome.tabs.sendMessage(tab.id, { action: "raceInfo" }, function (response) {
          console.log("service-worker response : " + response.data);

          courseName = response.data.CourseName;
          raceNo = response.data.RaceNo;
          raceStatus = response.data.RaceStatus;

          sendMessage = false;

          console.log("Race Status : " + raceStatus);

          if ((activeTab.CourseName == '') || (activeTab.CourseName !== courseName) || (activeTab.RaceNo !== raceNo)) {

            console.log("Update Tab Race Status : " + raceStatus);
            sendMessage = true;
            activeTab.CourseName = courseName;
            activeTab.RaceNo = raceNo;
            activeTab.RaceStatus = raceStatus;
            activeTab.Race = undefined;
            activeTab.Exactas = undefined;
          } else if (activeTab.RaceStatus !== raceStatus) {
            console.log("New Tab Race Status : " + raceStatus);
            sendMessage = true;
            activeTab.RaceStatus = raceStatus;
          }

          if (sendMessage) {
            console.log("Race Status (Send) : " + raceStatus);
            //var title = 'Race ' + raceNo + ' ' + courseName.toUpperCase() + ' (' + raceStatus + ')';
            //chrome.tabs.sendMessage(tab.id, { action: "title", data: title }, {
            //});
            var raceUpdate = new RaceUpdate(RaceInfoUpdated, courseName, raceNo);
            raceUpdate.RaceStatus = raceStatus;
            webSocket.send(JSON.stringify(raceUpdate));
          }

          // NextRace
          if (raceStatus === 'All Paying') {
            //console.log("Next Race : " + raceNo + 1);
            chrome.tabs.sendMessage(tab.id, { action: "clickRaceNo", data: raceNo + 1 }, {
            });
          }
        });
        break;

      case GetRace:
        // Get Race
        console.log("State : GetRace");

        activeTab.TabState = ClickExacta;  // Next Task


        var sendMessage = false;
        chrome.tabs.sendMessage(tab.id, { action: "race" }, function (response) {
          console.log("service-worker response : " + response.data);

          var race = response.data;

          sendMessage = false;
          if ((activeTab.CourseName === race.CourseName) && (activeTab.RaceNo == race.RaceNo)) {
            if (activeTab.Race == undefined) {
              sendMessage = true;
              activeTab.Race = response.data;
            } else {
              var equal = CompareOdds(response.data, activeTab.Race);
              if (!equal) {
                sendMessage = true;
                activeTab.Race = race;
              }
            }
          } else {
            console.log('CouseName or RaceNo Missmatch');
          }



          if (sendMessage) {
            var race = response.data;
            var courseName = race.CourseName;
            var raceNo = race.RaceNo;
            var raceUpdate = new RaceUpdate(RaceUpdated, courseName, raceNo);
            raceUpdate.Race = race;
            raceUpdate.RaceStatus = race.RaceStatus;
            webSocket.send(JSON.stringify(raceUpdate));
          }

        });
        break;

      case ClickExacta:

        console.log("State : ClickExacta");


        chrome.tabs.sendMessage(tab.id, { action: "clickExacta" }, function (response) {
          console.log("service-worker response : " + response.data);

        });

        activeTab.TabState = ClickApproximates;  // Next Task
        activeTab.Timer = 1;

        break;

      case ClickApproximates:

        console.log("State : ClickApproximates");

        // Get Exacta
        chrome.tabs.sendMessage(tab.id, { action: "clickApprox" }, function (response) {
          console.log("service-worker response : " + response.data);

        });

        activeTab.TabState = GetExacta;  // Next Task
        activeTab.Timer = 1;

        break;

      case GetExacta:

        console.log("State : GetExacta");

        // Get Exacta
        chrome.tabs.sendMessage(tab.id, { action: "exacta" }, function (response) {
          //console.log("service-worker response : " + response.data);

          var sendMessage = false;
          var raceInfo = response.raceInfo;
          if ((activeTab.CourseName === raceInfo.CourseName) && (activeTab.RaceNo === raceInfo.RaceNo)) {

            if (activeTab.Exactas == undefined) {
              sendMessage = true;
              activeTab.Exactas = response.data;
            } else {

              var equal = CompareExactas(response.data, activeTab.Exactas)
              if (!equal) {
                sendMessage = true;
                activeTab.Exactas = response.data;
              }
            }
          } else {
            console.log('Exacta CouseName or RaceNo Missmatch');
          }

          if (sendMessage) {

            var raceUpdate = new RaceUpdate(ExactaUpdated, activeTab.CourseName, activeTab.RaceNo);
            raceUpdate.Exactas = response.data;


            webSocket.send(JSON.stringify(raceUpdate));
          }

          activeTab.TabState = ClickWinPlace;  // Next Task
          activeTab.Timer = 1;

        });
        break;

      case ClickWinPlace:

        activeTab.TabState = GetRaceInfo;  // Next Task

        chrome.tabs.sendMessage(tab.id, { action: "clickWinPlace" }, function (response) {
          console.log("service-worker response : " + response.data);

        });
        break;


    }


  }
}



