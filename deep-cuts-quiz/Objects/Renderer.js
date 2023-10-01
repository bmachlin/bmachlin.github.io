class Renderer {
    constructor(context) {
        this.context = context;
        this.$gameArea = document.querySelector("#game-area");
        this.$loading = document.querySelector("#loading-text");
        this.$start = document.querySelector("#start-button");
        this.$next = document.querySelector("#next-button");
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
}