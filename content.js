// import Race from 'race.js';



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'raceInfo') {

        var courseName = GetCourseName();
        var raceNo = GetRaceNo();
        var status = GetRaceStatus();

        var raceInfo = new RaceInfo(courseName, raceNo, status);

        sendResponse({ data: raceInfo });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'clickRaceNo') {
        var result = false;
        var raceNo = Number(request.data);

        var raceNoElements = document.getElementsByClassName('meeting-info-race');
        if ((raceNoElements) && (raceNoElements.length > raceNo)) {
            raceNoElements[raceNo - 1].click();
            result = true;
        }
        sendResponse({ data: result });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'clickExacta') {
        var result = false;
        var selectionsElements = document.getElementsByClassName('tbc-nav-tabular-item-link');
        if ((selectionsElements) && (selectionsElements.length > 0)) {

            for (var index = 0; index < selectionsElements.length; index++) {

                var href = selectionsElements[index].getAttribute('href');
                if (href.includes('Exacta')) {
                    result = true;
                    selectionsElements[index].click();
                }
            }
        }
        sendResponse({ data: result });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'clickWinPlace') {
        var result = false;
        var selectionsElements = document.getElementsByClassName('tbc-nav-tabular-item-link');
        if ((selectionsElements) && (selectionsElements.length > 0)) {

            for (var index = 0; index < selectionsElements.length; index++) {

                var href = selectionsElements[index].getAttribute('href');
                if (href.includes('Win')) {
                    result = true;
                    selectionsElements[index].click();
                }
            }
        }
        sendResponse({ data: result });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'clickApprox') {
        var result = false;
        var approxElements = document.getElementsByClassName('approximates-button');
        if ((approxElements) && (approxElements.length = 1)) {

            var toggleFlucsElements = approxElements[0].getElementsByClassName('toggle-flucs-button');
            if ((toggleFlucsElements) && (toggleFlucsElements.length = 1)) {
                result = true;
                toggleFlucsElements[0].click();
            }
        }

        sendResponse({ data: result });
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'title') {

        const newTitle = request.data;
        document.title = newTitle;

    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'status') {
        var status = 'Not found';
        var raceElement = document.getElementsByClassName('race-metadata-list');
        if ((raceElement) && (raceElement.length == 1)) {
            var statusElement = raceElement[0].getElementsByClassName('status-text');
            if ((statusElement) && (statusElement.length == 1)) {
                status = statusElement[0].textContent;
            }
            else
                status = 'status-text not found';
        }
        else
            status = 'race-metadata-list not found';
        sendResponse({ data: status });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'race') {


        // Course Name
        var courseName = GetCourseName();
        // Race Number
        var raceNo = GetRaceNo();
        // Race Status
        var raceStatus = GetRaceStatus();

        // New Race
        var race = new Race(courseName, raceNo);
        race.RaceStatus = raceStatus;
        const currentUrl = document.location.href;
        race.Url = currentUrl;
        var raceDate = CheckForRaceDate(currentUrl);
        race.RaceDate = raceDate;


        // Pools
        var pools = GetPools();

        race.WinPool = pools.winPool;
        race.PlacePool = pools.placePool;
        race.QuinellaPool = pools.quinellaPool;
        race.TrifectaPool = pools.trifectaPool;
        race.ExactaPool = pools.exactaPool;
        race.DuetPool = pools.duetPool;
        race.DoublePool = pools.doublePool;
        race.DDoublePool = pools.dDoublePool;
        race.FirstFourPool = pools.firstFourPool;
        race.QuaddiePool = pools.quaddiePool;
        race.EarlyQuaddiePool = pools.earlyQuaddiePool;
        race.Big6Pool = pools.big6Pool;



        // Race Horses
        var pseudoBody = document.getElementsByClassName('pseudo-body');
        if ((pseudoBody) && (pseudoBody.length > 0)) {


            var pseudoRowCollection = pseudoBody[0].getElementsByClassName('row');

            if (pseudoRowCollection) {
                // Horse Number - Scratched
                for (var index = 0; index < pseudoRowCollection.length; index++) {

                    // Horse No
                    var horseNoResult = GetHorseNo(pseudoRowCollection[index]);
                    race.HorseNo.push(horseNoResult.horseNo);
                    race.Scratched.push(horseNoResult.scratched);

                    // Horse Name
                    var horseName = GetHorseName(pseudoRowCollection[index]);
                    const pos1 = horseName.indexOf('(');
                    const pos2 = horseName.indexOf(')');

                    if ((pos1 > 0) && (pos2 > 0)) {
                        var barrierStr = horseName.substring(pos1 + 1, pos2);
                        const barrier = Number(barrierStr);
                        race.Barrier.push(barrier);
                        horseName = horseName.substring(0, (pos1 - 1));
                        horseName = horseName.trim();
                    }

                    race.HorseName.push(horseName);

                    // Trainer - Jockey
                    var trainerJockeyResult = GetTrainerJockey(pseudoRowCollection[index]);
                    race.TrainerName.push(trainerJockeyResult.trainer);
                    race.JockeyName.push(trainerJockeyResult.jockey);

                    // Weight
                    var weight = GetWeight(pseudoRowCollection[index]);
                    race.Weight.push(weight);

                    // AAP-Rating
                    var rating = GetRating(pseudoRowCollection[index]);
                    race.Rating.push(rating);

                    // Win - Place

                    var priceCollection = pseudoRowCollection[index].getElementsByClassName('price-cell');
                    if ((priceCollection) && (priceCollection.length > 0)) {

                        for (var priceIndex = 0; priceIndex < priceCollection.length; priceIndex++) {


                            var ngIfAttribute = priceCollection[priceIndex].getAttribute('ng-if');

                            var animateOddsElements = priceCollection[priceIndex].getElementsByTagName('animate-odds-change');
                            if ((animateOddsElements) && (animateOddsElements.length == 1)) {

                                race.Debug = "Got Div Here";


                                var div1Elements = animateOddsElements[0].getElementsByTagName('div');
                                if ((div1Elements) && (div1Elements.length > 0)) {

                                    race.Debug = "Got Div 1";

                                    var div2Elements = div1Elements[0].getElementsByTagName('div');

                                    if ((div2Elements) && (div2Elements.length == 1)) {

                                        race.Debug = "Got Div 2";


                                        var win = 0;
                                        var place = 0;
                                        var fixedWin = 0;
                                        var fixedPlace = 0;
                                        var priceStr = div2Elements[0].textContent;
                                        if (priceStr.includes('N/A'))
                                            priceStr = '0';
                                        if (priceStr.includes('SCR'))
                                            priceStr = '0';
                                        priceStr = priceStr.replace(',', '');

                                        if ((ngIfAttribute) && (ngIfAttribute.includes('raceRunners.showFixedOddsWin'))) {
                                            fixedWin = Number(priceStr);
                                            if (fixedWin == null)
                                                race.Debug = ' Fixed Win Error ********************** ' + priceStr;
                                            race.FixedWin.push(fixedWin);
                                        }
                                        else if ((ngIfAttribute) && (ngIfAttribute.includes('raceRunners.showFixedOddsPlace'))) {

                                            fixedPlace = Number(priceStr);
                                            if (fixedPlace == null)
                                                race.Debug = ' Fixed Place Error ********************** ' + priceStr;
                                            race.FixedPlace.push(fixedPlace);
                                        }
                                        else if ((ngIfAttribute) && (ngIfAttribute.includes('raceRunners.showParimutuelWin'))) {
                                            win = Number(priceStr);
                                            if (win == null)
                                                race.Debug = ' Win Error ********************** ' + priceStr;
                                            race.Win.push(win);
                                        }
                                        else if ((ngIfAttribute) && (ngIfAttribute.includes('raceRunners.showParimutuelPlace'))) {
                                            place = Number(priceStr);
                                            if (place == null)
                                                race.Debug = ' Place Error ********************** ' + priceStr;
                                            race.Place.push(place);
                                        }

                                    }



                                }

                            }


                        }
                    }


                }
            }
        }
        sendResponse({ data: race });
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'exacta') {

        var courseName = GetCourseName();
        var raceNo = GetRaceNo();
        var status = GetRaceStatus();

        var raceInfo = new RaceInfo(courseName, raceNo, status);


        var exactas = [];

        var pseudoRowCombination = document.getElementsByClassName('approximate-combinations');
        var pseudoRowDividend = document.getElementsByClassName('approximate-dividend');
        if ((pseudoRowDividend) && (pseudoRowDividend.length > 0)) {

            if (pseudoRowCombination.length == pseudoRowDividend.length) {
                for (var index = 0; index < pseudoRowCombination.length; index++) {
                    if ((pseudoRowCombination) && (pseudoRowCombination.length > 0)) {
                        var horseNo1 = 0;
                        var horseNo2 = 0;
                        var pay = 0;
                        var innerText1 = pseudoRowCombination[index].textContent;
                        var innerText2 = pseudoRowDividend[index].textContent;
                        var split = innerText1.split('-');
                        if (split.length == 2) {
                            horseNo1 = Number(split[0]);
                            horseNo2 = Number(split[1]);
                        }
                        if (innerText2.startsWith('$')) {
                            innerText2 = innerText2.replace('$', '');
                            innerText2 = innerText2.trim();
                            innerText2 = innerText2.replace(',', '');

                            pay = Number(innerText2)
                        }

                        exactas.push({ horseNo1, horseNo2, pay })
                    }
                }
            }
        }
    }

    sendResponse({ data: exactas, raceInfo: raceInfo });

});


function CheckForRaceDate(url) {
    var courseName = '';
    var raceNo = '';
    var raceDate;

    if (url.includes('meetings')) {
    }
    else {
        var split = url.split('/');
        if ((split.Length == 9) || (split.Length == 10)) {
            courseName = split[5];
            raceNo = Number(split[8]);
        }
        split.forEach((item) => {

            if (item == 'today') {
                raceDate = new Date();
            }
            else if (item == 'yesterday') {
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

function GetHorseNo(pseudoRow) {
    var horseNo = 0;
    var scratched = false;
    var numberCollection = pseudoRow.getElementsByClassName('number-cell');
    if ((numberCollection) && (numberCollection.length == 1)) {
        if (numberCollection[0].className.includes('unselectable'))
            scratched = true;
        else
            scratched = false;
        var horseNoStr = numberCollection[0].textContent;
        horseNo = Number(horseNoStr);

    }

    return { horseNo: horseNo, scratched: scratched };
}

function GetTrainerJockey(pseudoRow) {
    var trainerName = '';
    var jockeyName = '';
    var runnerMetadataCollection = pseudoRow.getElementsByClassName('runner-metadata-list');
    if ((runnerMetadataCollection) && (runnerMetadataCollection.length > 0)) {
        var fullNameCollection = runnerMetadataCollection[0].getElementsByClassName('full-name');
        if ((fullNameCollection) && (fullNameCollection.length == 2)) {
            jockeyName = fullNameCollection[0].textContent;
            trainerName = fullNameCollection[1].textContent;
        }
    }
    return { trainer: trainerName, jockey: jockeyName };
}

function GetWeight(pseudoRow) {
    var weight = 0;
    var weightCollection = pseudoRow.getElementsByClassName('runner-weight-cell');
    if ((weightCollection) && (weightCollection.length == 1)) {
        var weightStr = weightCollection[0].textContent;
        weight = Number(weightStr);
    }
    return weight;
}

function GetRating(pseudoRow) {
    var rating = 0;
    var ratingCollection = pseudoRow.getElementsByClassName('runner-rating-cell');
    if ((ratingCollection) && (ratingCollection.length == 1)) {
        var ratingStr = ratingCollection[0].textContent;
        if (ratingStr != '–')
            rating = Number(ratingStr);
    }
    return rating;
}

function GetHorseName(pseudoRow) {

    var horseName = '';
    var nameCollection = pseudoRow.getElementsByClassName('runner-name');
    if ((nameCollection) && (nameCollection.length == 1)) {
        horseName = nameCollection[0].textContent;

    }
    return horseName
}

function GetPools() {
    winPool = 0;
    placePool = 0;
    quinellaPool = 0;
    trifectaPool = 0;
    exactaPool = 0;
    duetPool = 0;
    doublePool = 0;
    dDoublePool = 0;
    firstFourPool = 0;
    quaddiePool = 0;
    earlyQuaddiePool = 0;
    big6Pool = 0;
    debug = '';

    var poolElements = document.getElementsByClassName('pools-list');
    if ((poolElements) && (poolElements.length == 1)) {


        var poolListElements = poolElements[0].getElementsByTagName('li');
        if ((poolListElements) && (poolListElements.length > 0)) {

            for (var index = 0; index < poolListElements.length; index++) {


                var poolName = '';
                var poolValueStr = '';
                var poolValue = '';
                var poolSpanElements = poolListElements[index].getElementsByTagName('span');
                if ((poolSpanElements) && (poolSpanElements.length > 0)) {

                    for (var spanIndex = 0; spanIndex < poolSpanElements.length; spanIndex++) {



                        //var dataTestElement = poolSpanElements[spanIndex].getAttribute('data-test-pool-name'); // does not work
                        //if (dataTestElement) {
                        if (poolSpanElements[spanIndex].dataset.testPoolName !== undefined) {
                            //debug = ' dataTestElement found';

                            poolName = poolSpanElements[spanIndex].textContent;
                            poolName = poolName.trim();
                            //if (poolName != '')
                            //debug = poolName;
                        }
                        var className = poolSpanElements[spanIndex].className;

                        if ((className) && (className.includes('amount-span'))) {

                            poolValueStr = poolSpanElements[spanIndex].textContent
                            poolValueStr = poolValueStr.trim();

                            if (poolValueStr.startsWith('$')) {
                                poolValueStr = poolValueStr.replace(',', '');
                                poolValueStr = poolValueStr.replace('$', '');
                                poolValueStr = poolValueStr.trim();
                            }
                            poolValue = Number(poolValueStr);
                        }


                    }

                    if ((poolValue) && (poolName) && (poolValue != 0) && (poolName != '')) {
                        if (poolName.startsWith('Trifecta'))
                            poolName = 'Trifecta';
                        if (poolName.startsWith('Running Double'))
                            poolName = 'Running Double';
                        if (poolName.startsWith('Daily Double'))
                            poolName = 'Daily Double';
                        if (poolName.includes('Quinella'))
                            poolName = 'Quinella';
                        switch (poolName) {
                            case 'Win':
                                winPool = poolValue;
                                break;
                            case 'Place':
                                placePool = poolValue;
                                break;
                            case 'Trifecta':
                                trifectaPool = poolValue;
                                break;
                            case 'Quinella':
                                quinellaPool = poolValue;
                                break;
                            case 'Exacta':
                                exactaPool = poolValue;
                                break;
                            case 'Duet':
                                duetPool = poolValue;
                                break;
                            case 'First Four':
                                firstFourPool = poolValue;
                                break;
                            case 'Running Double':
                                doublePool = poolValue;
                                break;
                            case 'Daily Double':
                                dDoublePool = poolValue;
                                break;
                            case 'Quaddie':
                                quaddiePool = poolValue;
                                break;
                            case 'Early Quaddie':
                                earlyQuaddiePool = poolValue;
                                break;
                            case 'BIG6':
                                if (big6Pool != 0)  // Second Apperance is for first five races
                                    big6Pool = poolValue;
                                break;
                        }
                        poolName = '';
                        poolValue = 0;
                    }

                }
            }
        }
    }
    return {
        winPool: winPool,
        placePool: placePool,
        quinellaPool: quinellaPool,
        trifectaPool: trifectaPool,
        exactaPool: exactaPool,
        duetPool: duetPool,
        doublePool: doublePool,
        dDoublePool: dDoublePool,
        firstFourPool: firstFourPool,
        quaddiePool: quaddiePool,
        earlyQuaddiePool: earlyQuaddiePool,
        big6Pool: big6Pool,
        debug: debug
    };

}


function GetCourseName() {
    var courseName = '';
    var courseElement = document.getElementsByClassName('meeting-info-description');
    if (courseElement) {
        var text = courseElement.item(0).textContent;
        courseName = text.trim();
    }
    return courseName;
}

function GetRaceNo() {
    var raceNo = 0;
    var raceElement = document.getElementsByClassName('race-number');
    if (raceElement) {

        var text = raceElement.item(0).textContent;
        var raceNoStr = text.trim();
        if (raceNoStr.startsWith('R')) {
            raceNoStr = raceNoStr.replace('R', '');
            raceNo = Number(raceNoStr.trim());
        }
    }
    return raceNo;
}

function GetRaceStatus() {
    var status = 'Not found';
    var raceElement = document.getElementsByClassName('race-metadata-list');
    if ((raceElement) && (raceElement.length == 1)) {
        var statusElement = raceElement[0].getElementsByClassName('status-text');
        if ((statusElement) && (statusElement.length == 1)) {
            status = statusElement[0].textContent;
        }
        else
            status = 'status-text not found';
    }
    else
        status = 'race-metadata-list not found';
    return status;
}