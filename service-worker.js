const TAB_RACING = 'https://www.tab.com.au';
const TEN_SECONDS_MS = 10 * 1000;
let webSocket = null;

var activeWindowId = 0;
var activeTabIds = [];


//chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

chrome.tabs.onCreated.addListener(function (tab) {
  console.log('New Tab Created : ' + tab.id + " Window Id : " + tab.windowId);
  if (tab.windowId == activeWindowId) {
    AddActiveTab(tab.id);
  }
});


chrome.tabs.onAttached.addListener(async function (tabId, attachInfo) {
  console.log('Tab Attached : ' + tabId + " Window Id : " + attachInfo.newWindowId);

  if (tab.windowId == activeWindowId) {
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
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');

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
  activeTabIds.push(tabId);

  console.log(activeTabIds.length + ' Activate Tabs');
}

function TabIdExists(tabId) {
  //console.log('TabIdExists searching for ' + tabId);
  //console.log('TabIdExists checking ' + activeTabIds.length);
  //console.log('TabIdExists checking actual ' + activeTabIds[0]);

  var found = false;
  if (activeTabIds) {
    activeTabIds.forEach((activeTab) => {
      //console.log('TabIdExists checking ' + activeTab);
      if (activeTab === tabId) {
        found = true;
      }
    });
  }
  //console.log(tabId + ' found ' + found);
  return found;
}

/*
TabIdExists checking 1
service-worker.js:86 TabIdExists checking actual 1304153139
service-worker.js:89 TabIdExists checking 1304153139
service-worker.js:95 1304152839 does not exist
service-worker.js:84
*/

function RemoveActiveTab(tabId) {
  console.log('RemoveActiveTab Tabs');
  if (activeTabIds) {

    var index = 0;
    var tabIndex = 0;
    var found = false;
    activeTabIds.forEach((activeTab) => {
      if (activeTab == tabId) {
        console.log('RemoveActiveTab Tabs Id = ' + activeTab);
        found = true;
        tabIndex = index;
      }
      else
        index++;
    });
    if (found) {
      console.log('RemoveActiveTab Found ');
      activeTabIds.splice(tabIndex, 1);  // remove from array
      console.log(activeTabIds.length + ' Activate Tabs');
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

      activeTabIds = [];
      const allTabs = await chrome.tabs.query({});
      allTabs.forEach((tab) => {

        if (tab.windowId == activeWindowId)
          activeTabIds.push(tab.id);
      });
      console.log(activeTabIds.length + ' Activate Tabs');

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
}

function disconnect() {
  if (webSocket) {
    webSocket.close();
  }
}

function keepAlive() {
  const keepAliveIntervalId = setInterval(
    () => {
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
    TEN_SECONDS_MS
  );
}

function PollTabOldest() {

  (async () => {
    const response = await chrome.runtime.sendMessage({ action: "poll" });
    // do something with response here, not outside the function
    console.log("service-worker response : " + response.data);

    webSocket.send(response.data);
  })();
}

function PollTabOld() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "race" }, function (response) {
      console.log("service-worker response : " + response.data);

      webSocket.send(response.data);

    });
  });
}

async function PollTab() {

  const allTabs = await chrome.tabs.query({});

  const zeroPad = (num, places) => String(num).padStart(places, '0')

  allTabs.forEach((tab) => {

    if (TabIdExists(tab.id)) {

      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth();
      month++;
      var day = date.getDate();
      const today = year + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2);
      if (tab.url.includes('https://www.tab.com.au/racing/' + today)) {

        chrome.tabs.sendMessage(tab.id, { action: "raceInfo" }, function (response) {
          console.log("service-worker response : " + response.data);

          var courseName = response.data.CourseName;
          var raceNo = response.data.RaceNo;
          var raceStatus = response.data.RaceStatus;

          var title = 'Race ' + raceNo + ' ' + courseName.toUpperCase() + ' (' + raceStatus + ')';

          chrome.tabs.sendMessage(tab.id, { action: "title", data: title }, {
          });


        });


        chrome.tabs.sendMessage(tab.id, { action: "race" }, function (response) {
          console.log("service-worker response : " + response.data);

          webSocket.send(response.data);

        });
      }
    }
  });
}

/*

const allTabs = await chrome.tabs.query({});
allTabs.forEach((tab) => {
  if (tab.windowId != current.id) {
    chrome.tabs.move(tab.id, {
      windowId: current.id,
      index: tab.index
    });
  }
});
*/

//  (() => {
//    const response = chrome.runtime.sendMessage({ action: "poll" });
//    // do something with response here, not outside the function
//    console.log("service-worker response : " + response.data);
//    webSocket.send(response.data);
//  })();

//}


//chrome.webNavigation.onCompleted.addListener((details) => {
//
//  webSocket.send('Completed loading: ' + details.url);
//
//});

/*
chrome.webNavigation.onCompleted.addListener((details) => {

  if (webSocket) {
    webSocket.send('Completed loading: ' + details.url);
  }
  //
  //chrome.notifications.create({
  //  type: 'basic',
  //  iconUrl: 'icon.png',
  //  title: 'page loaded',
  //  message:
  //    'Completed loading: ' +
  //    details.url +
  //    ' at ' +
  //    details.timeStamp +
  //    ' milliseconds since the epoch.'
  //});
});
*/