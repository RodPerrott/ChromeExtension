class RaceUpdate {
    Update = 0;
    CourseName = "";
    RaceNo = 0;
    Race;
    RaceStatus;
    Exactas = [];

    constructor(update, courseName, raceNo) {
        this.Update = update;
        this.CourseName = courseName;
        this.RaceNo = raceNo;
    }
}

export default RaceUpdate;