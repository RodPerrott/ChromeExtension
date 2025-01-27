// import Race from 'race.js';

class MyRace {
    Debug = "";
    RaceDate;
    CourseName = "";
    RaceNo = 0;
    RaceStatus = "";
    Url = "";
    HorseNo = [];
    HorseName = [];
    Scratched = []
    TrainerName = [];
    JockeyName = [];
    Weight = [];
    Rating = [];
    Win = [];
    Place = [];
    FixedWin = [];
    FixedPlace = [];


    constructor(courseName, raceNo) {
        this.RaceDate = new Date();
        this.CourseName = courseName;
        this.RaceNo = raceNo;

    }

}


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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "status") {
        var status = "Not found";
        var raceElement = document.getElementsByClassName('race-metadata-list');
        if ((raceElement) && (raceElement.length == 1)) {
            var statusElement = raceElement[0].getElementsByClassName('status-text');
            if ((statusElement) && (statusElement.length == 1)) {
                status = statusElement[0].textContent;
            }
            else
                status = "status-text not found"
        }
        else
            status = "race-metadata-list not found";
        sendResponse({ data: status });
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "race") {

        // Course Name
        var courseName = "not found";
        var courseElement = document.getElementsByClassName('meeting-info-description');
        if (courseElement) {

            var text = courseElement.item(0).textContent;
            courseName = text.trim();
        }

        // Race Number

        var raceNo = 0;
        var raceElement = document.getElementsByClassName('race-number');
        if (raceElement) {

            var text = raceElement.item(0).textContent;
            var raceNoStr = text.trim();
            if (raceNoStr.startsWith("R")) {
                raceNoStr = raceNoStr.replace("R", "");
                raceNoStr = raceNoStr.trim();
            }
            raceNo = Number(raceNoStr);
        }

        // Race Status
        var raceStatus = "Not found";
        var raceElement = document.getElementsByClassName('race-metadata-list');
        if ((raceElement) && (raceElement.length == 1)) {
            var statusElement = raceElement[0].getElementsByClassName('status-text');
            if ((statusElement) && (statusElement.length == 1)) {
                raceStatus = statusElement[0].textContent;
            }
            else
                raceStatus = "status-text not found"
        }
        else
            raceStatus = "race-metadata-list not found";

        // New Race

        var race = new MyRace(courseName, raceNo);
        race.RaceStatus = raceStatus;
        const currentUrl = document.location.href;
        race.Url = currentUrl;
        var raceDate = CheckForRaceDate(currentUrl);
        race.RaceDate = raceDate;

        // Race Horses
        var pseudoBody = document.getElementsByClassName('pseudo-body');
        if ((pseudoBody) && (pseudoBody.length > 0)) {

            race.Debug = "pseudoBody found"
            var horseNo = 0;
            var horseName = "";

            var pseudoRowCollection = pseudoBody[0].getElementsByClassName('row');

            if (pseudoRowCollection) {
                // Horse Number - Scratched
                for (var index = 0; index < pseudoRowCollection.length; index++) {

                    var numberCollection = pseudoRowCollection[index].getElementsByClassName('number-cell');
                    if ((numberCollection) && (numberCollection.length == 1)) {
                        if (numberCollection[0].className.includes('unselectable'))
                            race.Scratched.push(true);
                        else
                            race.Scratched.push(false);
                        var horseNoStr = numberCollection[0].textContent;
                        horseNo = Number(horseNoStr);
                        race.HorseNo.push(horseNo);
                    }

                    // Horse Name
                    var nameCollection = pseudoRowCollection[index].getElementsByClassName('runner-name');
                    if ((nameCollection) && (nameCollection.length == 1)) {
                        var horseName = nameCollection[0].textContent;
                        race.HorseName.push(horseName);
                    }

                    // Trainer - Jockey
                    var runnerMetadataCollection = pseudoRowCollection[index].getElementsByClassName('runner-metadata-list');
                    if ((runnerMetadataCollection) && (runnerMetadataCollection.length > 0)) {
                        var fullNameCollection = runnerMetadataCollection[0].getElementsByClassName('full-name');
                        if ((fullNameCollection) && (fullNameCollection.length == 2)) {
                            var jockeyName = fullNameCollection[0].textContent;
                            race.JockeyName.push(jockeyName);
                            var trainerName = fullNameCollection[1].textContent;
                            race.TrainerName.push(trainerName);
                        }

                    }

                    // Weight
                    var weightCollection = pseudoRowCollection[index].getElementsByClassName('runner-weight-cell');
                    if ((weightCollection) && (weightCollection.length == 1)) {
                        var weightStr = weightCollection[0].textContent;

                        var weight = Number(weightStr);
                        race.Weight.push(weight);
                    }

                    // AAP-Rating
                    var ratingCollection = pseudoRowCollection[index].getElementsByClassName('runner-rating-cell');
                    if ((ratingCollection) && (ratingCollection.length == 1)) {
                        var ratingStr = ratingCollection[0].textContent;
                        var rating = 0;
                        if (ratingStr != '–')
                            rating = Number(ratingStr);
                        race.Rating.push(rating);
                    }

                    // Win - Place

                    var priceCollection = pseudoRowCollection[index].getElementsByClassName('price-cell');
                    if ((priceCollection) && (priceCollection.length > 0)) {


                        for (var priceIndex = 0; priceIndex < priceCollection.length; priceIndex++) {

                            var win = 0;
                            var place = 0;
                            var fixedWin = 0;
                            var fixedPlace = 0;

                            var dataId = priceCollection[priceIndex].getAttribute('ng-if');

                            var priceStr = priceCollection[priceIndex].textContent;
                            if (priceStr.includes('N/A'))
                                priceStr = '0';
                            if (priceStr.includes('SCR'))
                                priceStr = '0';

                            if (dataId) {

                                if (dataId.includes('showFixedOddsWin')) {
                                    fixedWin = Number(priceStr);
                                    race.FixedWin.push(fixedWin);
                                }
                                else if (dataId.includes('showFixedOddsPlace')) {
                                    fixedPlace = Number(priceStr);
                                    race.FixedPlace.push(fixedPlace);
                                }
                                else if (dataId.includes('showParimutuelWin')) {
                                    win = Number(priceStr);
                                    race.Win.push(win);
                                }
                                else if (dataId.includes('showParimutuelPlace')) {
                                    place = Number(priceStr);
                                    race.Place.push(place);
                                }
                            }
                        }


                    }
                }


            }
        }




        //sendResponse({ data: courseName + " race " + raceNo + " Status " + raceStatus });

        sendResponse({ data: JSON.stringify(race) });
    }

});


function CheckForRaceDate(url) {
    var courseName = "";
    var raceNo = ""
    var raceDate;

    if (url.includes("meetings")) {
    }
    else {
        var split = url.split('/');
        if ((split.Length == 9) || (split.Length == 10)) {
            courseName = split[5];
            raceNo = Number(split[8]);
        }
        split.forEach((item) => {

            if (item == "today") {
                raceDate = new Date();
            }
            else if (item == "yesterday") {
                var todayDate = new Date(); // today
                raceDate = todayDate.setDate(todayDate.getDate() - 1) // yesterday
            }
            else if (item.includes('-')) {
                var dateSplit = item.split('-');
                if (dateSplit.length == 3) {
                    if ((dateSplit[0].length == 4) && (dateSplit[1].length == 2) && (dateSplit[2].length == 2)) {
                        var year = Number(dateSplit[0]);
                        var month = Number(dateSplit[1]);
                        var day = Number(dateSplit[2]);

                        month = month - 1;  // JavaScript counts months from 0 to 11:

                        raceDate = new Date(year, month, day);

                    }
                }
            }
        });
    }
    return raceDate;
}