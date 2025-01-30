class Race {
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

    WinPool = 0;
    PlacePool = 0;
    QuinellaPool = 0;
    TrifectaPool = 0;
    ExactaPool = 0;
    DuetPool = 0;
    DoublePool = 0;
    DDoublePool = 0;
    FirstFourPool = 0;
    QuaddiePool = 0;
    EarlyQuaddiePool = 0;
    Big6Pool = 0;

    constructor(courseName, raceNo) {
        this.RaceDate = new Date();
        this.CourseName = courseName;
        this.RaceNo = raceNo;
    }
}
