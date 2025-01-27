class Race {
    RaceDate;
    CourseName = "";
    RaceNo = 0;
    RaceStatus = "";

    constructor(courseName, raceNo) {
        this.RaceDate = new Date();
        this.CourseName = courseName;
        this.RaceNo = raceNo;

    }

}