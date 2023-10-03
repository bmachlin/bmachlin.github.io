class Question {
    // type [choice, text, number, order]
    constructor(type, questionText, uri = null) {
        this.type = type;
        this.questionText = questionText;
        this.uri = uri;
    }
}