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

    // hide = hide finable words (false for testing)
    // showPrevFound = show words found in prev rounds
    RenderFindableWords(hide=false,showPrevFound=true) {
        let el = document.getElementById("findableWords");
        let c1 = el.children[0];
        let c2 = el.children[1];
        c1.replaceChildren();
        c2.replaceChildren();

        let fbwords = [...this.context.Game.findableWords];
        // sort first by word length, then alphabetically
        fbwords.sort((a,b) => {
            if (a.length != b.length) return a.length - b.length;
            return b < a;
        });

        let col = c1;
        for (let word of fbwords) {
            // adding 2 elems per word so halfway is when children = # of words
            if (col.childElementCount >= fbwords.length-1) col = c2;

            let child = document.createElement("span");
            if (this.context.Game.foundWords.has(word)) {
                child.innerHTML = word.toUpperCase();
            }
            else {
                child.innerHTML = this.BLANK_CHAR.repeat(word.length);
            }
            
            col.appendChild(child);
            col.appendChild(document.createElement("br"));
        }
    }
}