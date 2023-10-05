class Renderer {
    constructor(context) {
        this.context = context;
        this.$gameArea = document.querySelector("#game-area");
        this.$loading = document.querySelector("#loading-text");
        this.$start = document.querySelector("#start-button");
        this.$next = document.querySelector("#next-button");
        this.$answerArea = document.querySelector("#answer-area");
    }

    RenderHighScore() {
        
    }

    RenderQuestion(questionData) {
        this.$loading.hidden = true;
        this.$start.hidden = true;
        this.$next.hidden = true;
        this.$gameArea.hidden = false;
    }

    RenderLoading() {
        this.$loading.hidden = false;
        this.$start.hidden = true;
        this.$next.hidden = true;
        this.$gameArea.hidden = true;
    }

    RenderStart() {
        this.$loading.hidden = true;
        this.$start.hidden = false;
        this.$next.hidden = true;
        this.$gameArea.hidden = true;
    }

    UpdateGameInfo() {
        document.querySelector("#question-num").innerText = this.context.Game.currentQuestionNum;
        document.querySelector("#score").innerText = this.context.Game.score;
        document.querySelector("#high-score").innerText = this.context.Storage.getItem("high-score") ?? "0";
    }

    RenderChoiceQuestion(choiceQuestion, selectionCB) {
        this.$loading.hidden = true;
        this.$start.hidden = true;
        this.$next.hidden = true;
        this.$gameArea.hidden = false;

        if (!choiceQuestion.uri) {
            document.querySelector("#spotify-embed").hidden = true;
        }

        document.querySelector("#question-text").innerText = choiceQuestion.text;
        this.$answerArea.replaceChildren();
        let $answers = [];
        [choiceQuestion.correctAnswer, ...choiceQuestion.incorrectAnswers].forEach((item) => {
            let elem = document.createElement("div");
            elem.classList.add("mc-answer", "answer-button");
            elem.innerText = item;
            elem.addEventListener("click", (e) => {
                selectionCB(elem.innerText);
            });
            $answers.push(elem);
        });
        shuffleArray($answers);
        console.log($answers[0])
        $answers.forEach((ans) => {
            this.$answerArea.appendChild(ans);
        });
    }

    RevealChoiceQuestion(correct) {
        this.$loading.hidden = true;
        this.$start.hidden = true;
        this.$next.hidden = false;
        this.$gameArea.hidden = false;

        this.$answerArea.childNodes.forEach((elem) => {
            elem.classList.add(elem.innerText == correct ? "correct" : "incorrect"); 
        })
    }

    RenderTextQuestion(textQuestion) {

    }

    RenderNumberQuestion(numberQuestion) {
        
    }

    RenderOrderQuestion(orderQuestion) {

    }
}