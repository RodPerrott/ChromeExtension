chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "scrape") {
        console.log('Action  : scrape');
        //const titles = document.querySelectorAll('header'); // Example: Scrape all <h1> elements
        //const scrapedData = Array.from(titles).map(title => title.textContent);

        //console.log("Scrape Result " + scrapedData);

        var courseName = "abc";
        var courseElement = document.getElementsByClassName('meeting-info-description');
        if (courseElement) {
            //var text = await courseElement.item(0).GetTextContentAsync();
            //console.log('Course Element Length :' + courseElement.length);
            courseName = courseElement.item(0).textContent;

        }
        //}


        //}

        //sendResponse({ data: 'Hello World ha Ha\n' });

        sendResponse({ data: courseName });
        //sendResponse({ data: "abcdef\n" });

        //return true; // run async
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "courseName") {
        var courseName = "";
        var courseElement = document.getElementsByClassName('meeting-info-description');
        if (courseElement) {

            var text = courseElement.item(0).textContent;
            courseName = text.trim();

        }
        var raceElement = document.getElementsByClassName('race-number');
        if (raceElement) {

            var text = raceElement.item(0).textContent;
            var raceNo = text.trim();
            if (raceNo.startsWith("R")) {
                raceNo = raceNo.replace("R", "");
                raceNo = raceNo.trim();
                courseName += " Race " + raceNo;
            }

        }
        sendResponse({ data: courseName });
    }
});