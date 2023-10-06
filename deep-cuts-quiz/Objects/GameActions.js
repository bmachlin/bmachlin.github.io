class GameActions {
    constructor(context) {
        this.context = context;
        this.Game = this.context.Game;
        this.QuestionMaker = new QuestionMaker(this.Game.artist);
    }

    MakeQuestion() {
        this.Game.selected = false;
        this.Game.currentQuestion = this.QuestionMaker.GenerateQuestion();
    }

    ProcessAnswer(selection) {
        if (this.Game.selected) return;
        else this.Game.selected = true;
        if (selection == this.Game.currentQuestion.correctAnswer) {
            this.Game.score += 100;
            this.context.Renderer.UpdateGameInfo();
        }
    }

    NextQuestion() {
        this.Game.currentQuestionNum++;
        this.MakeQuestion();
        this.context.Renderer.UpdateGameInfo();
        this.context.Renderer.RenderChoiceQuestion(this.Game.currentQuestion, (selection) => {
            this.ProcessAnswer(selection);
            this.context.Renderer.RevealChoiceQuestion(context.Game.currentQuestion.correctAnswer);
        });
    }
}