class Renderer {
    constructor(context) {
        this.context = context;
        this.BLANK_CHAR = "￭";
        this.BLANK_CHAR2 = "-";
    }

    RenderLetters(rerender=false) {
        let lettersElem = document.getElementById("letters");
        if (rerender) {
            lettersElem.replaceChildren();
            for (let i = 0; i < this.context.Game.maxLetters; i++) {
                let newLetter = document.createElement("span");
                newLetter.className = "letterbox";
                newLetter.innerText = this.BLANK_CHAR2;
                lettersElem.appendChild(newLetter);
            }
        }

        if (this.context.Game.maxLetters != lettersElem.children.length) {
            console.log("game letters and letter boxes don't match", this.context.Game.maxLetters, lettersElem.children.length);
        }
        for (let i = 0; i < this.context.Game.maxLetters; i++) {
            if (i > this.context.Game.remainingLetters.length-1) {
                lettersElem.children[i].innerText = this.BLANK_CHAR2;
            }
            else {
                lettersElem.children[i].innerText = this.context.Game.remainingLetters[i].toUpperCase();
            }
        }
    }

    RenderWord(rerender=false) {
        let wordElem = document.getElementById("word");
        if (rerender) {
            wordElem.replaceChildren();
            for (let i = 0; i < this.context.Game.maxLetters; i++) {
                let newLetter = document.createElement("span");
                newLetter.className = "letterbox";
                newLetter.innerText = this.BLANK_CHAR2;
                wordElem.appendChild(newLetter);
            }
        }

        if (this.context.Game.maxLetters != wordElem.children.length) {
            console.log("game letters and letter boxes don't match", this.context.Game.maxLetters, wordElem.children.length);
        }
        for (let i = 0; i < this.context.Game.maxLetters; i++) {
            if (i > this.context.Game.currentWord.length-1) {
                wordElem.children[i].innerText = this.BLANK_CHAR2;
            }
            else {
                wordElem.children[i].innerText = this.context.Game.currentWord[i].toUpperCase();
            }
        }
    }

    RenderDownTimer() {

    }

    RenderUpTimer() {

    }

    RenderLevel() {

    }

    RenderHighScore() {
        document.getElementById(context.Settings.highScore.elementId).innerText = context.Settings.highScore.value;
    }

    // showUnfound = reveal all words
    RenderFindableWords(showUnfound=false) {
        let fbwords = [...this.context.Game.findableWords];
        // sort first by word length, then alphabetically
        fbwords.sort((a,b) => {
            if (a.length != b.length) return a.length - b.length;
            return b < a;
        });

        let wordListElem = document.getElementById("findableWords");
        wordListElem.replaceChildren();

        let columnCount = this.calcWordColumns(fbwords.length);
        let columns = [];
        for (let i = 0; i < columnCount; i++) {
            let col = document.createElement("div");
            col.className = "wordColumn";
            columns.push(col);
        }


        let colIndex = -1;
        let count = 0;
        let switchNum = Math.ceil(fbwords.length/columnCount);
        for (let word of fbwords) {
            if (count%switchNum == 0) {
                colIndex++;
            }
            // console.log(count,switchNum,count%switchNum, fbwords.length,columnCount,colIndex)
            
            let child = document.createElement("span");
            let text = this.BLANK_CHAR.repeat(word.length);
            child.classList.add("findable-word");
            if (this.context.Game.foundWords.has(word)) {
                text = word.toUpperCase();
            }
            else if (showUnfound) {
                child.classList.add("unfound-word");
                text = word.toUpperCase();
            }

            child.innerText = text;

            columns[colIndex].appendChild(child);
            count++;
        }
        wordListElem.append(...columns);
    }

    calcWordColumns(numWords) {
        return Math.ceil(numWords/15);
    }
}