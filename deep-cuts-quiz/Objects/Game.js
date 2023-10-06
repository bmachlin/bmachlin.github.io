class Game {
    constructor() {
        this.score = 0;
        this.currentQuestionNum = 1;
        this.currentQuestion = null;
        this.totalQuestions = 10;
        this.artist = new ArtistData();
        this.selected = false;
    }
}