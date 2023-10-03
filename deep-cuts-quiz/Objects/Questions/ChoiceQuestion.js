class ChoiceQuestion {
    constructor(text, correctAnswer, incorrectAnswers, uri = null) {
        this.text = text;
        this.correctAnswer = correctAnswer;
        this.incorrectAnswers = incorrectAnswers;
        this.uri = uri;
    }
}