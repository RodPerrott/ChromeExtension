class ActiveTab {
    TabId = "";
    Timer = 0;
    TabState = 0;
    RaceStatus = "";
    CourseName = "";
    RaceNo = 0;
    Race = undefined;
    Exactas = undefined;
    constructor(tabId) {
        this.TabId = tabId;
        this.TabState = 1;  // GetRaceInfo
        this.Timer = 1;

        this.RaceStatus = "";
        this.CourseName = "";
        this.RaceNo = 0;
        this.Race = undefined;
        this.Exactas = undefined;
    }
}

export default ActiveTab;