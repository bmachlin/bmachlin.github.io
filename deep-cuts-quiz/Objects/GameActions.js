class GameActions {
    constructor(context) {
        this.context = context;
        this.Game = this.context.Game;
        this.QuestionMaker = new QuestionMaker(this.Game.artist);
    }

    MakeQuestion() {
        this.Game.currentQuestion = this.QuestionMaker.GenerateQuestion();
    }

    ProcessAnswer(selection) {
        if (selection == this.Game.currentQuestion.correctAnswer) {
            this.Game.score += 100;
            this.context.Renderer.UpdateGameInfo();
        }
    }

    NextQuestion() {
        this.Game.currentQuestionNum++;
        this.context.Renderer.UpdateGameInfo();
    }
}