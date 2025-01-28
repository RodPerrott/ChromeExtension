class RaceInfo {
    CourseName = "";
    RaceNo = 0;
    RaceStatus = "";

    constructor(courseName, raceNo, raceStatus) {
        this.CourseName = courseName;
        this.RaceNo = raceNo;
        this.RaceStatus = raceStatus;
    }
}
window.RaceInfo = RaceInfo;