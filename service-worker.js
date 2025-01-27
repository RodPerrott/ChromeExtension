

const TAB_RACING = 'https://www.tab.com.au';
const TEN_SECONDS_MS = 10 * 1000;
let webSocket = null;

// Make sure the Glitch demo server is running
//fetch('https://chrome-extension-websockets.glitch.me/', { mode: 'no-cors' });

// Toggle WebSocket connection on action button click
// Send a message every 10 seconds, the ServiceWorker will
// be kept alive as long as messages are being sent.

//chrome.action.onClicked.addListener((tab) => {
//  chrome.scripting.executeScript({
//    target: {tabId: tab.id},
//    files: ['content.js']
//  });
//})
//chrome.runtime.onInstalled.addListener(() => {
//  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
//});


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
    if (webSocket) {
      disconnect();
    } else {
      connect();
      keepAlive();
    }
  };
});

// Not Called
chrome.action.onClicked.addListener(async () => {
  console.log('service-worker onClicked');
  if (webSocket) {
    disconnect();
  } else {
    connect();
    keepAlive();
  }
});

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

function PollTabOld() {

  (async () => {
    const response = await chrome.runtime.sendMessage({ action: "poll" });
    // do something with response here, not outside the function
    console.log("service-worker response : " + response.data);

    webSocket.send(response.data);
  })();
}

function PollTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "race" }, function (response) {
      console.log("service-worker response : " + response.data);

      webSocket.send(response.data);

    });
  });
}



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