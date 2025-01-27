
document.getElementById('scrapeButton').addEventListener('click', () => {
    // Send a message to the content script to request data
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "status" }, function (response) {
            const resultDiv = document.getElementById('result');

            resultDiv.textContent = response.data;
        });
    });
});

document.getElementById('connectButton').addEventListener('click', () => {

    (async () => {
        const response = await chrome.runtime.sendMessage({ action: "connect" });
    })();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "poll") {
        console.log('Poll');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "courseName" }, function (response) {



                // do something with response here, not outside the function

                console.log('Poll response is : ' + response.data);
                sendResponse({ data: response.data });

            });
        });
        return true;
    }
});


//-----------------------------------------------------------------------------------------  
// GetCourseName
//-----------------------------------------------------------------------------------------  
function GetCourseNameOld() {
    // Course Name

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "courseName" }, function (response) {
            console.log('Response is : ' + response.data);
            return response.data;
        });
    });
}

//-----------------------------------------------------------------------------------------  
// GetCourseName2
//-----------------------------------------------------------------------------------------  
async function GetCourseName() {

    (async () => {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "courseName" });
        // do something with response here, not outside the function
        console.log('Response is : ' + response.data);
        return response.data;
    })();
}

